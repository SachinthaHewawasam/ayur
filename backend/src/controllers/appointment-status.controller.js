import { AppointmentService } from '../application/services/AppointmentService.js';

const appointmentService = new AppointmentService();

/**
 * Start appointment (mark as in progress)
 * PUT /api/appointments/:id/start
 */
export const startAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;
    
    const appointment = await appointmentService.startAppointment(id, clinicId);
    
    res.json({
      message: 'Appointment started successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete appointment
 * PUT /api/appointments/:id/complete
 */
export const completeAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;
    const { diagnosis, treatment_notes, followup_date } = req.body;
    
    const appointment = await appointmentService.markAsCompleted(id, clinicId, {
      diagnosis,
      treatmentNotes: treatment_notes,
      followupDate: followup_date
    });
    
    res.json({
      message: 'Appointment completed successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark appointment as missed
 * PUT /api/appointments/:id/miss
 */
export const markAsMissed = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;
    const { reason } = req.body;
    
    const appointment = await appointmentService.markAsMissed(id, clinicId, reason);
    
    res.json({
      message: 'Appointment marked as missed',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel appointment
 * PATCH /api/appointments/:id/cancel
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;
    const { reason } = req.body;
    
    const appointment = await appointmentService.cancelAppointment(id, clinicId, reason);
    
    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get status transition rules for an appointment
 * GET /api/appointments/:id/status-rules
 */
export const getStatusRules = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;
    
    const appointment = await appointmentService.getAppointment(id, clinicId);
    const rules = appointmentService.getStatusTransitionRules(appointment.status);
    
    res.json({ rules });
  } catch (error) {
    next(error);
  }
};
