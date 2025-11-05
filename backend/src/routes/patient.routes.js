import express from 'express';
import {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientHistory
} from '../controllers/patient.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createPatientSchema,
  updatePatientSchema
} from '../validators/patient.validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all patients (accessible by all roles)
router.get('/', getPatients);

// Get single patient
router.get('/:id', getPatient);

// Get patient history
router.get('/:id/history', getPatientHistory);

// Create patient (doctor, receptionist, admin)
router.post(
  '/',
  authorize('doctor', 'receptionist', 'admin'),
  validate(createPatientSchema),
  createPatient
);

// Update patient (doctor, receptionist, admin)
router.put(
  '/:id',
  authorize('doctor', 'receptionist', 'admin'),
  validate(updatePatientSchema),
  updatePatient
);

// Delete patient (admin only)
router.delete('/:id', authorize('admin'), deletePatient);

export default router;
