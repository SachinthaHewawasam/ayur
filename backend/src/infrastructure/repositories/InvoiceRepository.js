import { pool, getClient } from '../../config/database.js';
import { BaseRepository } from './BaseRepository.js';
import { Invoice } from '../../domain/models/Invoice.js';
import { NotFoundError, DatabaseError } from '../../domain/errors/index.js';

export class InvoiceRepository extends BaseRepository {
  constructor() {
    super('invoices', Invoice);
  }
  
  /**
   * Find invoice by ID with patient details
   */
  async findById(id, clinicId) {
    try {
      const query = `
        SELECT
          i.*,
          p.name as patient_name,
          p.phone as patient_phone
        FROM invoices i
        LEFT JOIN patients p ON i.patient_id = p.id
        WHERE i.id = $1 AND i.clinic_id = $2
      `;
      
      const result = await pool.query(query, [id, clinicId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Invoice(result.rows[0]);
    } catch (error) {
      throw new DatabaseError(`Failed to find invoice: ${error.message}`);
    }
  }
  
  /**
   * Find all invoices by clinic with filters
   */
  async findAllByClinic(clinicId, filters = {}) {
    try {
      let query = `
        SELECT
          i.id, i.invoice_number, i.invoice_date, i.status,
          i.total_amount, i.paid_amount, i.due_date,
          p.id as patient_id, p.name as patient_name, p.phone as patient_phone,
          i.created_at
        FROM invoices i
        LEFT JOIN patients p ON i.patient_id = p.id
        WHERE i.clinic_id = $1
      `;
      
      const params = [clinicId];
      let paramCount = 2;

      if (filters.status) {
        query += ` AND i.status = $${paramCount}`;
        params.push(filters.status);
        paramCount++;
      }

      if (filters.patientId) {
        query += ` AND i.patient_id = $${paramCount}`;
        params.push(filters.patientId);
        paramCount++;
      }

      if (filters.search) {
        query += ` AND (i.invoice_number ILIKE $${paramCount} OR p.name ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
        paramCount++;
      }

      if (filters.startDate) {
        query += ` AND i.invoice_date >= $${paramCount}`;
        params.push(filters.startDate);
        paramCount++;
      }

      if (filters.endDate) {
        query += ` AND i.invoice_date <= $${paramCount}`;
        params.push(filters.endDate);
        paramCount++;
      }

      query += ' ORDER BY i.invoice_date DESC';

      const result = await pool.query(query, params);
      return result.rows.map(row => new Invoice(row));
    } catch (error) {
      throw new DatabaseError(`Failed to find invoices: ${error.message}`);
    }
  }
  
  /**
   * Generate next invoice number
   */
  async generateInvoiceNumber(clinicId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM invoices
        WHERE clinic_id = $1
      `;
      
      const result = await pool.query(query, [clinicId]);
      const count = parseInt(result.rows[0].count) + 1;
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      
      return `INV-${year}${month}-${String(count).padStart(5, '0')}`;
    } catch (error) {
      throw new DatabaseError(`Failed to generate invoice number: ${error.message}`);
    }
  }
  
  /**
   * Create new invoice
   */
  async create(invoice) {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      const data = invoice.toDatabase();
      const query = `
        INSERT INTO invoices (
          clinic_id, invoice_number, patient_id, invoice_date,
          due_date, status, total_amount, paid_amount,
          discount_amount, tax_amount, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      
      const values = [
        data.clinic_id,
        data.invoice_number,
        data.patient_id,
        data.invoice_date,
        data.due_date,
        data.status,
        data.total_amount,
        data.paid_amount,
        data.discount_amount,
        data.tax_amount,
        data.notes
      ];
      
      const result = await client.query(query, values);
      await client.query('COMMIT');
      
      return new Invoice(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new DatabaseError(`Failed to create invoice: ${error.message}`);
    } finally {
      client.release();
    }
  }
  
  /**
   * Update invoice
   */
  async update(invoice) {
    try {
      const data = invoice.toDatabase();
      const query = `
        UPDATE invoices
        SET status = $1,
            total_amount = $2,
            paid_amount = $3,
            discount_amount = $4,
            tax_amount = $5,
            due_date = $6,
            notes = $7
        WHERE id = $8 AND clinic_id = $9
        RETURNING *
      `;
      
      const values = [
        data.status,
        data.total_amount,
        data.paid_amount,
        data.discount_amount,
        data.tax_amount,
        data.due_date,
        data.notes,
        invoice.id,
        invoice.clinicId
      ];
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new NotFoundError('Invoice not found');
      }
      
      return new Invoice(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to update invoice: ${error.message}`);
    }
  }
  
  /**
   * Record payment
   */
  async recordPayment(invoiceId, amount, paymentMethod, notes) {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      // Update invoice paid amount
      const updateQuery = `
        UPDATE invoices
        SET paid_amount = paid_amount + $1,
            status = CASE
              WHEN paid_amount + $1 >= total_amount THEN 'paid'
              WHEN paid_amount + $1 > 0 THEN 'partial'
              ELSE status
            END
        WHERE id = $2
        RETURNING *
      `;
      
      const updateResult = await client.query(updateQuery, [amount, invoiceId]);
      
      if (updateResult.rows.length === 0) {
        throw new NotFoundError('Invoice not found');
      }
      
      // Record payment transaction
      const paymentQuery = `
        INSERT INTO invoice_payments (
          invoice_id, amount, payment_method, notes
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      await client.query(paymentQuery, [invoiceId, amount, paymentMethod, notes]);
      
      await client.query('COMMIT');
      
      return new Invoice(updateResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to record payment: ${error.message}`);
    } finally {
      client.release();
    }
  }
  
  /**
   * Get invoice statistics
   */
  async getInvoiceStats(clinicId, startDate, endDate) {
    try {
      const query = `
        SELECT
          COUNT(*) as total_invoices,
          SUM(total_amount) as total_amount,
          SUM(paid_amount) as total_paid,
          SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
          SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END) as partial_count,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
          SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_count
        FROM invoices
        WHERE clinic_id = $1
          AND invoice_date >= $2
          AND invoice_date <= $3
      `;
      
      const result = await pool.query(query, [clinicId, startDate, endDate]);
      return result.rows[0];
    } catch (error) {
      throw new DatabaseError(`Failed to get invoice stats: ${error.message}`);
    }
  }
  
  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(clinicId) {
    try {
      const query = `
        SELECT
          i.*,
          p.name as patient_name,
          p.phone as patient_phone
        FROM invoices i
        LEFT JOIN patients p ON i.patient_id = p.id
        WHERE i.clinic_id = $1
          AND i.status != 'paid'
          AND i.status != 'cancelled'
          AND i.due_date < CURRENT_DATE
        ORDER BY i.due_date ASC
      `;
      
      const result = await pool.query(query, [clinicId]);
      return result.rows.map(row => new Invoice(row));
    } catch (error) {
      throw new DatabaseError(`Failed to get overdue invoices: ${error.message}`);
    }
  }
}
