import { pool, getClient } from '../../config/database.js';
import { BaseRepository } from './BaseRepository.js';
import { Patient } from '../../domain/models/Patient.js';
import { NotFoundError, DatabaseError } from '../../domain/errors/index.js';

export class PatientRepository extends BaseRepository {
  constructor() {
    super('patients', Patient);
  }
  
  /**
   * Find patient by ID with clinic check
   */
  async findById(id, clinicId) {
    try {
      const query = `SELECT * FROM patients WHERE id = $1 AND clinic_id = $2`;
      const result = await pool.query(query, [id, clinicId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Patient(result.rows[0]);
    } catch (error) {
      throw new DatabaseError(`Failed to find patient: ${error.message}`);
    }
  }
  
  /**
   * Find all patients by clinic with filters
   */
  async findAllByClinic(clinicId, filters = {}) {
    try {
      let query = `
        SELECT id, patient_code, name, phone, email, age, gender,
               dosha_type, created_at, is_active
        FROM patients
        WHERE clinic_id = $1
      `;
      const params = [clinicId];
      let paramCount = 2;
      
      if (filters.search) {
        query += ` AND (name ILIKE $${paramCount} OR phone ILIKE $${paramCount} OR patient_code ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
        paramCount++;
      }
      
      if (filters.isActive !== undefined) {
        query += ` AND is_active = $${paramCount}`;
        params.push(filters.isActive);
        paramCount++;
      }
      
      query += ` ORDER BY created_at DESC`;
      
      if (filters.limit) {
        query += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
        paramCount++;
      }
      
      if (filters.offset) {
        query += ` OFFSET $${paramCount}`;
        params.push(filters.offset);
      }
      
      const result = await pool.query(query, params);
      return result.rows.map(row => new Patient(row));
    } catch (error) {
      throw new DatabaseError(`Failed to find patients: ${error.message}`);
    }
  }
  
  /**
   * Count patients by clinic
   */
  async countByClinic(clinicId, filters = {}) {
    try {
      let query = 'SELECT COUNT(*) FROM patients WHERE clinic_id = $1';
      const params = [clinicId];
      let paramCount = 2;
      
      if (filters.search) {
        query += ` AND (name ILIKE $${paramCount} OR phone ILIKE $${paramCount} OR patient_code ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
        paramCount++;
      }
      
      if (filters.isActive !== undefined) {
        query += ` AND is_active = $${paramCount}`;
        params.push(filters.isActive);
      }
      
      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new DatabaseError(`Failed to count patients: ${error.message}`);
    }
  }
  
  /**
   * Find patient by phone
   */
  async findByPhone(phone, clinicId) {
    try {
      const query = `SELECT * FROM patients WHERE phone = $1 AND clinic_id = $2`;
      const result = await pool.query(query, [phone, clinicId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Patient(result.rows[0]);
    } catch (error) {
      throw new DatabaseError(`Failed to find patient by phone: ${error.message}`);
    }
  }
  
  /**
   * Create new patient
   */
  async create(patient) {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      const data = patient.toDatabase();
      const query = `
        INSERT INTO patients (
          clinic_id, patient_code, name, date_of_birth, age, gender,
          phone, email, address, dosha_type, allergies, medical_history,
          emergency_contact_name, emergency_contact_phone
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;
      
      const values = [
        data.clinic_id,
        data.patient_code,
        data.name,
        data.date_of_birth,
        data.age,
        data.gender,
        data.phone,
        data.email,
        data.address,
        data.dosha_type,
        data.allergies,
        data.medical_history,
        data.emergency_contact_name,
        data.emergency_contact_phone
      ];
      
      const result = await client.query(query, values);
      await client.query('COMMIT');
      
      return new Patient(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new DatabaseError(`Failed to create patient: ${error.message}`);
    } finally {
      client.release();
    }
  }
  
  /**
   * Update patient
   */
  async update(patient) {
    try {
      const data = patient.toDatabase();
      const query = `
        UPDATE patients
        SET name = $1,
            date_of_birth = $2,
            age = $3,
            gender = $4,
            phone = $5,
            email = $6,
            address = $7,
            dosha_type = $8,
            allergies = $9,
            medical_history = $10,
            emergency_contact_name = $11,
            emergency_contact_phone = $12,
            is_active = $13
        WHERE id = $14 AND clinic_id = $15
        RETURNING *
      `;
      
      const values = [
        data.name,
        data.date_of_birth,
        data.age,
        data.gender,
        data.phone,
        data.email,
        data.address,
        data.dosha_type,
        data.allergies,
        data.medical_history,
        data.emergency_contact_name,
        data.emergency_contact_phone,
        data.is_active,
        patient.id,
        patient.clinicId
      ];
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new NotFoundError('Patient not found');
      }
      
      return new Patient(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to update patient: ${error.message}`);
    }
  }
  
  /**
   * Get patient appointment history
   */
  async getAppointmentHistory(patientId, clinicId) {
    try {
      const query = `
        SELECT
          a.id, a.appointment_date, a.appointment_time, a.status,
          a.chief_complaint, a.diagnosis, a.treatment_notes, a.followup_date,
          u.name as doctor_name
        FROM appointments a
        LEFT JOIN users u ON a.doctor_id = u.id
        WHERE a.patient_id = $1 AND a.clinic_id = $2
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `;
      
      const result = await pool.query(query, [patientId, clinicId]);
      return result.rows;
    } catch (error) {
      throw new DatabaseError(`Failed to get appointment history: ${error.message}`);
    }
  }
}
