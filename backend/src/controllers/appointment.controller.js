import { AppointmentService } from '../application/services/AppointmentService.js';

const appointmentService = new AppointmentService();

/**
 * Get all appointments
 * GET /api/appointments
 */
export const getAppointments = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic_id;
    const { date, status, doctor_id, patient_id, start_date, end_date } = req.query;
    
    const appointments = await appointmentService.getAllAppointments(clinicId, {
      date,
      status,
      doctorId: doctor_id,
      patientId: patient_id,
      startDate: start_date,
      endDate: end_date
    });
    
    res.json({ appointments });
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointment by ID
 * GET /api/appointments/:id
 */
export const getAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;
    
    const appointment = await appointmentService.getAppointment(id, clinicId);
    
    res.json({ appointment });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new appointment
 * POST /api/appointments
 */
export const createAppointment = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic_id;
    
    const appointment = await appointmentService.createAppointment(clinicId, req.body);
    
    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update appointment
 * PUT /api/appointments/:id
 */
export const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;
    
    const appointment = await appointmentService.updateAppointment(id, clinicId, req.body);
    
    res.json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel appointment
 * PUT /api/appointments/:id/cancel
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinic_id;
    
    const appointment = await appointmentService.cancelAppointment(id, clinicId);
    
    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get today's appointments
 * GET /api/appointments/today
 */
export const getTodayAppointments = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic_id;
    
    const result = await appointmentService.getTodaysAppointments(clinicId);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get upcoming followups
 * GET /api/appointments/followups
 */
export const getUpcomingFollowups = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic_id;
    const days = parseInt(req.query.days) || 7;
    
    const followups = await appointmentService.getUpcomingFollowups(clinicId, days);
    
    res.json({ followups });
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointment statistics
 * GET /api/appointments/stats
 */
export const getAppointmentStats = async (req, res, next) => {
  try {
    const clinicId = req.user.clinic_id;
    const { start_date, end_date } = req.query;
    
    const stats = await appointmentService.getAppointmentStats(clinicId, start_date, end_date);
    
    res.json({ stats });
  } catch (error) {
    next(error);
  }
};
