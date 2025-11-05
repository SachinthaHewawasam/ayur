import express from 'express';
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getTodayAppointments,
  getUpcomingFollowups
} from '../controllers/appointment.controller.js';
import {
  startAppointment,
  completeAppointment,
  markAsMissed,
  getStatusRules
} from '../controllers/appointment-status.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createAppointmentSchema,
  updateAppointmentSchema
} from '../validators/appointment.validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get today's appointments
router.get('/today', getTodayAppointments);

// Get upcoming follow-ups
router.get('/followups/upcoming', getUpcomingFollowups);

// Get all appointments
router.get('/', getAppointments);

// Get single appointment
router.get('/:id', getAppointment);

// Create appointment (doctor, receptionist, admin)
router.post(
  '/',
  authorize('doctor', 'receptionist', 'admin'),
  validate(createAppointmentSchema),
  createAppointment
);

// Update appointment (doctor, receptionist, admin)
router.put(
  '/:id',
  authorize('doctor', 'receptionist', 'admin'),
  validate(updateAppointmentSchema),
  updateAppointment
);

// Status management endpoints
router.patch(
  '/:id/start',
  authorize('doctor', 'receptionist', 'admin'),
  startAppointment
);

router.patch(
  '/:id/complete',
  authorize('doctor', 'receptionist', 'admin'),
  completeAppointment
);

router.patch(
  '/:id/miss',
  authorize('doctor', 'receptionist', 'admin'),
  markAsMissed
);

router.patch(
  '/:id/cancel',
  authorize('doctor', 'receptionist', 'admin'),
  cancelAppointment
);

// Get status transition rules
router.get('/:id/status-rules', getStatusRules);

export default router;
