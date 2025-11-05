import { pool } from '../../config/database.js';

export class SettingsRepository {
  /**
   * Get settings by clinic ID
   */
  async getByClinicId(clinicId) {
    const query = `
      SELECT * FROM settings
      WHERE clinic_id = $1
    `;
    
    const result = await pool.query(query, [clinicId]);
    return result.rows[0] || null;
  }

  /**
   * Create or update settings
   */
  async upsert(clinicId, data) {
    const query = `
      INSERT INTO settings (
        clinic_id, system_name, clinic_name, clinic_address, 
        clinic_phone, clinic_email
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (clinic_id) 
      DO UPDATE SET
        system_name = EXCLUDED.system_name,
        clinic_name = EXCLUDED.clinic_name,
        clinic_address = EXCLUDED.clinic_address,
        clinic_phone = EXCLUDED.clinic_phone,
        clinic_email = EXCLUDED.clinic_email,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      clinicId,
      data.system_name,
      data.clinic_name,
      data.clinic_address,
      data.clinic_phone,
      data.clinic_email
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}
