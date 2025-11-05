import { pool, getClient } from '../../config/database.js';
import { BaseRepository } from './BaseRepository.js';
import { Appointment } from '../../domain/models/Appointment.js';
import { NotFoundError, DatabaseError, ConflictError } from '../../domain/errors/index.js';

export class AppointmentRepository extends BaseRepository {
  constructor() {
    super('appointments', Appointment);
  }
  
  /**
   * Find appointment by ID with patient and doctor details
   */
  async findById(id, clinicId) {
    try {
      const query = `
        SELECT
          a.*,
          p.name as patient_name,
          p.phone as patient_phone,
          p.patient_code,
          p.dosha_type,
          p.allergies,
          p.medical_history,
          u.name as doctor_name
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        LEFT JOIN users u ON a.doctor_id = u.id
        WHERE a.id = $1 AND a.clinic_id = $2
      `;
      
      const result = await pool.query(query, [id, clinicId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Appointment(result.rows[0]);
    } catch (error) {
      throw new DatabaseError(`Failed to find appointment: ${error.message}`);
    }
  }
  
  /**
   * Find all appointments by clinic with filters
   */
  async findAllByClinic(clinicId, filters = {}) {
    try {
      let query = `
        SELECT
          a.id, a.appointment_date, a.appointment_time, a.duration_minutes,
          a.status, a.chief_complaint, a.followup_date,
          p.id as patient_id, p.name as patient_name, p.phone as patient_phone,
          p.patient_code,
          u.id as doctor_id, u.name as doctor_name,
          a.created_at
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        LEFT JOIN users u ON a.doctor_id = u.id
        WHERE a.clinic_id = $1
      `;
      
      const params = [clinicId];
      let paramCount = 2;

      if (filters.date) {
        query += ` AND a.appointment_date = $${paramCount}`;
        params.push(filters.date);
        paramCount++;
      }

      if (filters.startDate) {
        query += ` AND a.appointment_date >= $${paramCount}`;
        params.push(filters.startDate);
        paramCount++;
      }

      if (filters.endDate) {
        query += ` AND a.appointment_date <= $${paramCount}`;
        params.push(filters.endDate);
        paramCount++;
      }

      if (filters.status) {
        query += ` AND a.status = $${paramCount}`;
        params.push(filters.status);
        paramCount++;
      }

      if (filters.doctorId) {
        query += ` AND a.doctor_id = $${paramCount}`;
        params.push(filters.doctorId);
        paramCount++;
      }

      if (filters.patientId) {
        query += ` AND a.patient_id = $${paramCount}`;
        params.push(filters.patientId);
        paramCount++;
      }

      query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

      const result = await pool.query(query, params);
      return result.rows.map(row => new Appointment(row));
    } catch (error) {
      throw new DatabaseError(`Failed to find appointments: ${error.message}`);
    }
  }
  
  /**
   * Check for conflicting appointments
   */
  async checkConflict(doctorId, date, time, excludeId = null) {
    try {
      let query = `
        SELECT id FROM appointments
        WHERE doctor_id = $1
          AND appointment_date = $2
          AND appointment_time = $3
          AND status NOT IN ('cancelled', 'missed')
      `;
      const params = [doctorId, date, time];

      if (excludeId) {
        query += ` AND id != $4`;
        params.push(excludeId);
      }

      const result = await pool.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      throw new DatabaseError(`Failed to check appointment conflict: ${error.message}`);
    }
  }
  
  /**
   * Create new appointment
   */
  async create(appointment) {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      // Check for conflicts
      const hasConflict = await this.checkConflict(
        appointment.doctorId,
        appointment.appointmentDate,
        appointment.appointmentTime
      );
      
      if (hasConflict) {
        throw new ConflictError('This time slot is already booked');
      }
      
      const data = appointment.toDatabase();
      const query = `
        INSERT INTO appointments (
          clinic_id, patient_id, doctor_id, appointment_date,
          appointment_time, duration_minutes, chief_complaint, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const values = [
        data.clinic_id,
        data.patient_id,
        data.doctor_id,
        data.appointment_date,
        data.appointment_time,
        data.duration_minutes,
        data.chief_complaint,
        data.status || 'scheduled'
      ];
      
      const result = await client.query(query, values);
      await client.query('COMMIT');
      
      return new Appointment(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      if (error instanceof ConflictError) throw error;
      throw new DatabaseError(`Failed to create appointment: ${error.message}`);
    } finally {
      client.release();
    }
  }
  
  /**
   * Update appointment
   */
  async update(appointment) {
    try {
      const data = appointment.toDatabase();
      const query = `
        UPDATE appointments
        SET appointment_date = $1,
            appointment_time = $2,
            status = $3,
            chief_complaint = $4,
            diagnosis = $5,
            treatment_notes = $6,
            followup_date = $7
        WHERE id = $8 AND clinic_id = $9
        RETURNING *
      `;
      
      const values = [
        data.appointment_date,
        data.appointment_time,
        data.status,
        data.chief_complaint,
        data.diagnosis,
        data.treatment_notes,
        data.followup_date,
        appointment.id,
        appointment.clinicId
      ];
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new NotFoundError('Appointment not found');
      }
      
      // Fetch the full appointment details with patient info
      return await this.findById(appointment.id, appointment.clinicId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to update appointment: ${error.message}`);
    }
  }
  
  /**
   * Get today's appointments
   */
  async getTodaysAppointments(clinicId) {
    try {
      const query = `
        SELECT
          a.*,
          p.name as patient_name,
          p.phone as patient_phone,
          p.patient_code,
          u.name as doctor_name
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        LEFT JOIN users u ON a.doctor_id = u.id
        WHERE a.clinic_id = $1
          AND a.appointment_date = CURRENT_DATE
        ORDER BY a.appointment_time ASC
      `;
      
      const result = await pool.query(query, [clinicId]);
      return result.rows.map(row => new Appointment(row));
    } catch (error) {
      throw new DatabaseError(`Failed to get today's appointments: ${error.message}`);
    }
  }
  
  /**
   * Get upcoming followups
   */
  async getUpcomingFollowups(clinicId, days = 7) {
    try {
      const query = `
        SELECT
          a.*,
          p.name as patient_name,
          p.phone as patient_phone,
          p.patient_code
        FROM appointments a
        LEFT JOIN patients p ON a.patient_id = p.id
        WHERE a.clinic_id = $1
          AND a.followup_date IS NOT NULL
          AND a.followup_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $2 * INTERVAL '1 day'
        ORDER BY a.followup_date ASC
      `;
      
      const result = await pool.query(query, [clinicId, days]);
      return result.rows.map(row => new Appointment(row));
    } catch (error) {
      throw new DatabaseError(`Failed to get upcoming followups: ${error.message}`);
    }
  }
  
  /**
   * Get prescriptions for an appointment
   */
  async getPrescriptions(appointmentId) {
    try {
      const query = `
        SELECT
          p.id, p.dosage, p.frequency, p.duration_days,
          p.quantity_prescribed, p.special_instructions,
          m.id as medicine_id, m.name as medicine_name,
          m.category, m.sanskrit_name
        FROM prescriptions p
        LEFT JOIN medicines m ON p.medicine_id = m.id
        WHERE p.appointment_id = $1
      `;
      
      const result = await pool.query(query, [appointmentId]);
      return result.rows;
    } catch (error) {
      throw new DatabaseError(`Failed to get prescriptions: ${error.message}`);
    }
  }
}
