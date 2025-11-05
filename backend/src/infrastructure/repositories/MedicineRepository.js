import { pool, getClient } from '../../config/database.js';
import { BaseRepository } from './BaseRepository.js';
import { Medicine } from '../../domain/models/Medicine.js';
import { NotFoundError, DatabaseError } from '../../domain/errors/index.js';

export class MedicineRepository extends BaseRepository {
  constructor() {
    super('medicines', Medicine);
  }
  
  /**
   * Find all medicines with filters
   */
  async findAll(filters = {}) {
    try {
      let query = `SELECT * FROM medicines WHERE 1=1`;
      const params = [];
      let paramCount = 1;
      
      if (filters.activeOnly) {
        query += ` AND is_active = true`;
      }
      
      if (filters.search) {
        query += ` AND (name ILIKE $${paramCount} OR sanskrit_name ILIKE $${paramCount} OR category ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
        paramCount++;
      }
      
      if (filters.category) {
        query += ` AND category = $${paramCount}`;
        params.push(filters.category);
        paramCount++;
      }
      
      if (filters.lowStock) {
        query += ` AND quantity_stock <= minimum_stock_level`;
      }
      
      query += ` ORDER BY name ASC`;
      
      const result = await pool.query(query, params);
      return result.rows.map(row => new Medicine(row));
    } catch (error) {
      throw new DatabaseError(`Failed to find medicines: ${error.message}`);
    }
  }
  
  /**
   * Create new medicine
   */
  async create(medicine) {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      const data = medicine.toDatabase();
      const query = `
        INSERT INTO medicines (
          clinic_id, name, sanskrit_name, category, manufacturer,
          batch_number, manufacturing_date, expiry_date, quantity_stock,
          unit, minimum_stock_level, price_per_unit, description,
          storage_instructions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;
      
      const values = [
        data.clinic_id,
        data.name,
        data.sanskrit_name,
        data.category,
        data.manufacturer,
        data.batch_number,
        data.manufacturing_date,
        data.expiry_date,
        data.quantity_stock,
        data.unit,
        data.minimum_stock_level,
        data.price_per_unit,
        data.description,
        data.storage_instructions
      ];
      
      const result = await client.query(query, values);
      await client.query('COMMIT');
      
      return new Medicine(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new DatabaseError(`Failed to create medicine: ${error.message}`);
    } finally {
      client.release();
    }
  }
  
  /**
   * Update medicine
   */
  async update(medicine) {
    try {
      const data = medicine.toDatabase();
      const query = `
        UPDATE medicines SET
          name = $1,
          sanskrit_name = $2,
          category = $3,
          manufacturer = $4,
          batch_number = $5,
          manufacturing_date = $6,
          expiry_date = $7,
          quantity_stock = $8,
          unit = $9,
          minimum_stock_level = $10,
          price_per_unit = $11,
          description = $12,
          storage_instructions = $13,
          is_active = $14
        WHERE id = $15
        RETURNING *
      `;
      
      const values = [
        data.name,
        data.sanskrit_name,
        data.category,
        data.manufacturer,
        data.batch_number,
        data.manufacturing_date,
        data.expiry_date,
        data.quantity_stock,
        data.unit,
        data.minimum_stock_level,
        data.price_per_unit,
        data.description,
        data.storage_instructions,
        data.is_active,
        medicine.id
      ];
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new NotFoundError('Medicine not found');
      }
      
      return new Medicine(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to update medicine: ${error.message}`);
    }
  }
  
  /**
   * Get low stock medicines
   */
  async getLowStockMedicines() {
    try {
      const query = `
        SELECT *
        FROM medicines
        WHERE quantity_stock <= minimum_stock_level
          AND is_active = true
        ORDER BY (quantity_stock::DECIMAL / NULLIF(minimum_stock_level, 1)) ASC
      `;
      
      const result = await pool.query(query);
      return result.rows.map(row => new Medicine(row));
    } catch (error) {
      throw new DatabaseError(`Failed to get low stock medicines: ${error.message}`);
    }
  }
  
  /**
   * Get expiring medicines
   */
  async getExpiringMedicines(days = 30) {
    try {
      const query = `
        SELECT *
        FROM medicines
        WHERE expiry_date IS NOT NULL
          AND expiry_date <= CURRENT_DATE + $1 * INTERVAL '1 day'
          AND expiry_date >= CURRENT_DATE
          AND is_active = true
          AND quantity_stock > 0
        ORDER BY expiry_date ASC
      `;
      
      const result = await pool.query(query, [days]);
      return result.rows.map(row => new Medicine(row));
    } catch (error) {
      throw new DatabaseError(`Failed to get expiring medicines: ${error.message}`);
    }
  }
  
  /**
   * Get stock movements for a medicine
   */
  async getStockMovements(medicineId, limit = 50) {
    try {
      const query = `
        SELECT
          sm.*,
          u.name as performed_by_name
        FROM stock_movements sm
        LEFT JOIN users u ON sm.performed_by = u.id
        WHERE sm.medicine_id = $1
        ORDER BY sm.created_at DESC
        LIMIT $2
      `;
      
      const result = await pool.query(query, [medicineId, limit]);
      return result.rows;
    } catch (error) {
      throw new DatabaseError(`Failed to get stock movements: ${error.message}`);
    }
  }
}
