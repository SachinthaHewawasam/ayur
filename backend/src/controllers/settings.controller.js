import { SettingsService } from '../application/services/SettingsService.js';

const settingsService = new SettingsService();

/**
 * Get system settings
 * GET /api/settings/system
 */
export const getSystemSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings(req.user.clinic_id);
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update system settings
 * PUT /api/settings/system
 */
export const updateSystemSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.updateSettings(
      req.user.clinic_id,
      req.body
    );
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    next(error);
  }
};
