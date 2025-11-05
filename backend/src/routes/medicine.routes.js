import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  updateStock,
  getLowStockAlerts,
  getExpiringMedicines,
  getInventoryStats,
  deleteMedicine
} from '../controllers/medicine.controller.js';
import {
  validateRequest,
  createMedicineSchema,
  updateMedicineSchema,
  updateStockSchema
} from '../validators/medicine.validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get inventory statistics
router.get('/stats', getInventoryStats);

// Get low stock alerts
router.get('/alerts/low-stock', getLowStockAlerts);

// Get expiring medicines
router.get('/alerts/expiring', getExpiringMedicines);

// Get all medicines (with filters)
router.get('/', getAllMedicines);

// Get medicine by ID
router.get('/:id', getMedicineById);

// Create new medicine (pharmacy or admin only)
router.post('/', authorize('pharmacy', 'admin'), validateRequest(createMedicineSchema), createMedicine);

// Update medicine (pharmacy or admin only)
router.put('/:id', authorize('pharmacy', 'admin'), validateRequest(updateMedicineSchema), updateMedicine);

// Update stock (pharmacy or admin only)
router.patch('/:id/stock', authorize('pharmacy', 'admin'), validateRequest(updateStockSchema), updateStock);

// Delete medicine (soft delete - admin only)
router.delete('/:id', authorize('admin'), deleteMedicine);

export default router;
