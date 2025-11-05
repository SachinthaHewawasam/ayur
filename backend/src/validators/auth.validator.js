import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required(),
  role: Joi.string().valid('admin', 'doctor', 'receptionist', 'pharmacy').required(),
  clinic_id: Joi.number().integer().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  phone: Joi.string().pattern(/^[0-9]{10}$/)
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(50).required()
});

export default {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
};
