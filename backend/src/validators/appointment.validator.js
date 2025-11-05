import Joi from 'joi';

export const createAppointmentSchema = Joi.object({
  patient_id: Joi.number().integer().required(),
  doctor_id: Joi.number().integer().required(),
  appointment_date: Joi.date().required(),
  appointment_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required(),
  duration_minutes: Joi.number().integer().min(15).max(180).default(30),
  chief_complaint: Joi.string().max(1000).optional()
});

export const updateAppointmentSchema = Joi.object({
  appointment_date: Joi.date(),
  appointment_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
  status: Joi.string().valid('scheduled', 'in_progress', 'completed', 'cancelled', 'missed', 'rescheduled'),
  chief_complaint: Joi.string().max(1000),
  diagnosis: Joi.string().max(2000),
  treatment_notes: Joi.string().max(2000),
  followup_date: Joi.date().allow(null, '')
});

export default {
  createAppointmentSchema,
  updateAppointmentSchema
};
