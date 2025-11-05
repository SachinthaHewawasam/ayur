import Joi from 'joi';

export const createPatientSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  date_of_birth: Joi.date().optional(),
  age: Joi.number().integer().min(0).max(150).required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  email: Joi.string().email().optional(),
  address: Joi.string().max(500).optional(),
  dosha_type: Joi.string()
    .valid('vata', 'pitta', 'kapha', 'vata_pitta', 'pitta_kapha', 'vata_kapha', 'tridosha')
    .optional(),
  allergies: Joi.string().max(1000).optional(),
  medical_history: Joi.string().max(2000).optional(),
  emergency_contact_name: Joi.string().max(255).optional(),
  emergency_contact_phone: Joi.string().pattern(/^[0-9]{10}$/).optional()
});

export const updatePatientSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  date_of_birth: Joi.date(),
  age: Joi.number().integer().min(0).max(150),
  gender: Joi.string().valid('Male', 'Female', 'Other'),
  phone: Joi.string().pattern(/^[0-9]{10}$/),
  email: Joi.string().email(),
  address: Joi.string().max(500),
  dosha_type: Joi.string()
    .valid('vata', 'pitta', 'kapha', 'vata_pitta', 'pitta_kapha', 'vata_kapha', 'tridosha'),
  allergies: Joi.string().max(1000),
  medical_history: Joi.string().max(2000),
  emergency_contact_name: Joi.string().max(255),
  emergency_contact_phone: Joi.string().pattern(/^[0-9]{10}$/)
});

export default {
  createPatientSchema,
  updatePatientSchema
};
