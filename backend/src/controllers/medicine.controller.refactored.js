import { MedicineService } from '../application/services/MedicineService.js';

const medicineService = new MedicineService();

/**
 * Get all medicines
 * GET /api/medicines
 */
export const getAllMedicines = async (req, res, next) => {
  try {
    const medicines = await medicineService.getAllMedicines(req.query);
    
    res.json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get medicine by ID
 * GET /api/medicines/:id
 */
export const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await medicineService.getMedicineById(req.params.id);
    
    res.json({
      success: true,
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new medicine
 * POST /api/medicines
 */
export const createMedicine = async (req, res, next) => {
  try {
    const medicine = await medicineService.createMedicine(
      req.user.clinic_id,
      req.user.id,
      req.body
    );
    
    res.status(201).json({
      success: true,
      message: 'Medicine added successfully',
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update medicine
 * PUT /api/medicines/:id
 */
export const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await medicineService.updateMedicine(
      req.params.id,
      req.body
    );
    
    res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update stock
 * PATCH /api/medicines/:id/stock
 */
export const updateStock = async (req, res, next) => {
  try {
    const result = await medicineService.updateStock(
      req.params.id,
      req.user.id,
      req.body
    );
    
    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get low stock alerts
 * GET /api/medicines/alerts/low-stock
 */
export const getLowStockAlerts = async (req, res, next) => {
  try {
    const alerts = await medicineService.getLowStockAlerts();
    
    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get expiring medicines
 * GET /api/medicines/alerts/expiring
 */
export const getExpiringMedicines = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const medicines = await medicineService.getExpiringMedicines(days);
    
    res.json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get inventory statistics
 * GET /api/medicines/stats
 */
export const getInventoryStats = async (req, res, next) => {
  try {
    const stats = await medicineService.getInventoryStats(req.user.clinic_id);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete medicine (soft delete)
 * DELETE /api/medicines/:id
 */
export const deleteMedicine = async (req, res, next) => {
  try {
    await medicineService.deleteMedicine(req.params.id);
    
    res.json({
      success: true,
      message: 'Medicine deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};
