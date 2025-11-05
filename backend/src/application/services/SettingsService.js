import { SettingsRepository } from '../../infrastructure/repositories/SettingsRepository.js';
import { NotFoundError } from '../../domain/errors/index.js';

export class SettingsService {
  constructor() {
    this.settingsRepo = new SettingsRepository();
  }

  /**
   * Get system settings for a clinic
   */
  async getSettings(clinicId) {
    const settings = await this.settingsRepo.getByClinicId(clinicId);
    
    if (!settings) {
      // Return default settings if none exist
      return {
        system_name: 'ACMS',
        clinic_name: '',
        clinic_address: '',
        clinic_phone: '',
        clinic_email: ''
      };
    }

    return settings;
  }

  /**
   * Update system settings
   */
  async updateSettings(clinicId, data) {
    const settings = await this.settingsRepo.upsert(clinicId, {
      system_name: data.system_name || 'ACMS',
      clinic_name: data.clinic_name || null,
      clinic_address: data.clinic_address || null,
      clinic_phone: data.clinic_phone || null,
      clinic_email: data.clinic_email || null
    });

    return settings;
  }
}
