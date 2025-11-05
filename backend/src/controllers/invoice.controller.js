import { pool, getClient } from '../config/database.js';

/**
 * Generate invoice number
 */
const generateInvoiceNumber = async (clinicId) => {
  const prefix = 'INV';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  // Get the latest invoice number for this month
  const result = await pool.query(
    `SELECT bill_number FROM bills
     WHERE clinic_id = $1
     AND bill_number LIKE $2
     ORDER BY created_at DESC LIMIT 1`,
    [clinicId, `${prefix}${year}${month}%`]
  );

  let sequence = 1;
  if (result.rows.length > 0) {
    const lastNumber = result.rows[0].bill_number;
    const lastSequence = parseInt(lastNumber.slice(-4));
    sequence = lastSequence + 1;
  }

  return `${prefix}${year}${month}${sequence.toString().padStart(4, '0')}`;
};

/**
 * Get all invoices with filters
 */
export const getAllInvoices = async (req, res) => {
  try {
    const clinicId = req.user.clinic_id;
    const {
      search,
      status,
      invoice_type,
      start_date,
      end_date,
      payment_status
    } = req.query;

    let query = `
      SELECT
        b.*,
        p.name as patient_name,
        p.phone as patient_phone,
        p.email as patient_email,
        u.name as created_by_name,
        COUNT(bi.id) as item_count
      FROM bills b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN bill_items bi ON b.id = bi.bill_id
      WHERE b.clinic_id = $1
    `;

    const params = [clinicId];
    let paramCount = 2;

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (
        b.bill_number ILIKE $${paramCount} OR
        b.customer_name ILIKE $${paramCount} OR
        p.name ILIKE $${paramCount} OR
        p.phone ILIKE $${paramCount}
      )`;
      paramCount++;
    }

    if (payment_status) {
      params.push(payment_status);
      query += ` AND b.payment_status = $${paramCount}`;
      paramCount++;
    }

    if (invoice_type) {
      params.push(invoice_type);
      query += ` AND b.invoice_type = $${paramCount}`;
      paramCount++;
    }

    if (start_date) {
      params.push(start_date);
      query += ` AND b.invoice_date >= $${paramCount}`;
      paramCount++;
    }

    if (end_date) {
      params.push(end_date);
      query += ` AND b.invoice_date <= $${paramCount}`;
      paramCount++;
    }

    query += ` GROUP BY b.id, p.name, p.phone, p.email, u.name`;
    query += ` ORDER BY b.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      invoices: result.rows
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: error.message
    });
  }
};

/**
 * Get invoice by ID with all items
 */
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get invoice details
    const invoiceQuery = `
      SELECT
        b.*,
        p.name as patient_name,
        p.phone as patient_phone,
        p.email as patient_email,
        p.address as patient_address,
        p.patient_code,
        u.name as created_by_name,
        c.name as clinic_name,
        c.address as clinic_address,
        c.phone as clinic_phone,
        c.email as clinic_email
      FROM bills b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN clinics c ON b.clinic_id = c.id
      WHERE b.id = $1
    `;

    // Get invoice items
    const itemsQuery = `
      SELECT
        bi.*,
        m.name as medicine_name,
        m.sanskrit_name
      FROM bill_items bi
      LEFT JOIN medicines m ON bi.medicine_id = m.id
      WHERE bi.bill_id = $1
      ORDER BY bi.id
    `;

    const [invoiceResult, itemsResult] = await Promise.all([
      pool.query(invoiceQuery, [id]),
      pool.query(itemsQuery, [id])
    ]);

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      invoice: {
        ...invoiceResult.rows[0],
        items: itemsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice',
      error: error.message
    });
  }
};

/**
 * Create new invoice
 */
export const createInvoice = async (req, res) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const {
      patient_id,
      appointment_id,
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      customer_gstin,
      invoice_type = 'retail',
      invoice_date,
      due_date,
      items, // Array of { item_type, medicine_id, item_name, description, quantity, unit, price_per_unit, discount, tax_percentage }
      consultation_fee = 0,
      additional_charges = 0,
      discount = 0,
      tax = 0,
      payment_status = 'pending',
      payment_method,
      payment_date,
      notes,
      terms_and_conditions
    } = req.body;

    const clinicId = req.user.clinic_id;

    // Generate invoice number
    const billNumber = await generateInvoiceNumber(clinicId);

    // Calculate totals from items
    let medicineTotal = 0;
    const processedItems = items.map(item => {
      const itemSubtotal = item.quantity * item.price_per_unit;
      const itemDiscount = item.discount || 0;
      const itemTax = ((itemSubtotal - itemDiscount) * (item.tax_percentage || 0)) / 100;
      const itemTotal = itemSubtotal - itemDiscount + itemTax;

      medicineTotal += itemTotal;

      return {
        ...item,
        total: itemTotal
      };
    });

    const total = parseFloat(consultation_fee) + medicineTotal + parseFloat(additional_charges) - parseFloat(discount) + parseFloat(tax);

    // Insert invoice
    const invoiceQuery = `
      INSERT INTO bills (
        clinic_id, patient_id, appointment_id, bill_number,
        customer_name, customer_phone, customer_email, customer_address, customer_gstin,
        invoice_type, invoice_date, due_date,
        consultation_fee, medicine_cost, additional_charges, discount, tax, total,
        payment_status, payment_method, payment_date, notes, terms_and_conditions,
        created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24
      ) RETURNING *
    `;

    const invoiceValues = [
      clinicId,
      patient_id || null,
      appointment_id || null,
      billNumber,
      customer_name || null,
      customer_phone || null,
      customer_email || null,
      customer_address || null,
      customer_gstin || null,
      invoice_type,
      invoice_date || new Date(),
      due_date || null,
      consultation_fee,
      medicineTotal,
      additional_charges,
      discount,
      tax,
      total,
      payment_status,
      payment_method || null,
      payment_date || null,
      notes || null,
      terms_and_conditions || null,
      req.user.id
    ];

    const invoiceResult = await client.query(invoiceQuery, invoiceValues);
    const invoice = invoiceResult.rows[0];

    // Insert invoice items
    for (const item of processedItems) {
      const itemQuery = `
        INSERT INTO bill_items (
          bill_id, item_type, medicine_id, item_name, description,
          quantity, unit, price_per_unit, discount, tax_percentage, total
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;

      await client.query(itemQuery, [
        invoice.id,
        item.item_type,
        item.medicine_id || null,
        item.item_name,
        item.description || null,
        item.quantity,
        item.unit || 'units',
        item.price_per_unit,
        item.discount || 0,
        item.tax_percentage || 0,
        item.total
      ]);

      // Update medicine stock if item is a medicine
      if (item.medicine_id && item.item_type === 'medicine') {
        // Reduce stock
        await client.query(
          'UPDATE medicines SET quantity_stock = quantity_stock - $1 WHERE id = $2',
          [item.quantity, item.medicine_id]
        );

        // Record stock movement
        await client.query(
          `INSERT INTO stock_movements (medicine_id, type, quantity, reason, reference_id, performed_by)
           VALUES ($1, 'out', $2, 'Sold - Invoice #' || $3, $4, $5)`,
          [item.medicine_id, item.quantity, billNumber, invoice.id, req.user.id]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      invoice: {
        ...invoice,
        items: processedItems
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating invoice',
      error: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Update invoice
 */
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      payment_status,
      payment_method,
      payment_date,
      notes,
      due_date
    } = req.body;

    const updateQuery = `
      UPDATE bills SET
        payment_status = COALESCE($1, payment_status),
        payment_method = COALESCE($2, payment_method),
        payment_date = COALESCE($3, payment_date),
        notes = COALESCE($4, notes),
        due_date = COALESCE($5, due_date)
      WHERE id = $6
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      payment_status,
      payment_method,
      payment_date,
      notes,
      due_date,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      invoice: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating invoice',
      error: error.message
    });
  }
};

/**
 * Get invoice statistics
 */
export const getInvoiceStats = async (req, res) => {
  try {
    const clinicId = req.user.clinic_id;

    const statsQuery = `
      SELECT
        COUNT(*) as total_invoices,
        SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN payment_status = 'partial' THEN 1 ELSE 0 END) as partial_count,
        SUM(total) as total_revenue,
        SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END) as paid_amount,
        SUM(CASE WHEN payment_status = 'pending' THEN total ELSE 0 END) as pending_amount,
        SUM(CASE WHEN payment_status = 'partial' THEN total ELSE 0 END) as partial_amount
      FROM bills
      WHERE clinic_id = $1
    `;

    const result = await pool.query(statsQuery, [clinicId]);

    res.json({
      success: true,
      stats: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice stats',
      error: error.message
    });
  }
};

export default {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  getInvoiceStats
};
