import { pool } from '../../config/database.js';
import { DatabaseError, NotFoundError } from '../../domain/errors/index.js';

/**
 * Base Repository with common CRUD operations
 */
export class BaseRepository {
  constructor(tableName, ModelClass) {
    this.tableName = tableName;
    this.ModelClass = ModelClass;
  }
  
  /**
   * Find record by ID
   */
  async findById(id) {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new this.ModelClass(result.rows[0]);
    } catch (error) {
      throw new DatabaseError(`Failed to find ${this.tableName}: ${error.message}`);
    }
  }
  
  /**
   * Find all records
   */
  async findAll(filters = {}) {
    try {
      let query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
      const params = [];
      let paramCount = 1;
      
      // Add filters dynamically
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query += ` AND ${key} = $${paramCount}`;
          params.push(value);
          paramCount++;
        }
      });
      
      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      return result.rows.map(row => new this.ModelClass(row));
    } catch (error) {
      throw new DatabaseError(`Failed to find ${this.tableName}: ${error.message}`);
    }
  }
  
  /**
   * Count records
   */
  async count(filters = {}) {
    try {
      let query = `SELECT COUNT(*) FROM ${this.tableName} WHERE 1=1`;
      const params = [];
      let paramCount = 1;
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query += ` AND ${key} = $${paramCount}`;
          params.push(value);
          paramCount++;
        }
      });
      
      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new DatabaseError(`Failed to count ${this.tableName}: ${error.message}`);
    }
  }
  
  /**
   * Check if record exists
   */
  async exists(id) {
    try {
      const query = `SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE id = $1)`;
      const result = await pool.query(query, [id]);
      return result.rows[0].exists;
    } catch (error) {
      throw new DatabaseError(`Failed to check existence in ${this.tableName}: ${error.message}`);
    }
  }
  
  /**
   * Soft delete (set is_active = false)
   */
  async softDelete(id) {
    try {
      const query = `
        UPDATE ${this.tableName}
        SET is_active = FALSE
        WHERE id = $1
        RETURNING id
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw new NotFoundError(`${this.tableName} not found`);
      }
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to delete ${this.tableName}: ${error.message}`);
    }
  }
  
  /**
   * Hard delete (permanent)
   */
  async hardDelete(id) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`;
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw new NotFoundError(`${this.tableName} not found`);
      }
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to hard delete ${this.tableName}: ${error.message}`);
    }
  }
}
