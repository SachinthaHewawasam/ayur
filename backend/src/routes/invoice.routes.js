import express from 'express';
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  getInvoiceStats
} from '../controllers/invoice.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get invoice statistics
router.get('/stats', getInvoiceStats);

// Get all invoices
router.get('/', getAllInvoices);

// Get single invoice
router.get('/:id', getInvoiceById);

// Create invoice (receptionist, pharmacy, admin)
router.post(
  '/',
  authorize('receptionist', 'pharmacy', 'admin'),
  createInvoice
);

// Update invoice (receptionist, pharmacy, admin)
router.put(
  '/:id',
  authorize('receptionist', 'pharmacy', 'admin'),
  updateInvoice
);

export default router;
