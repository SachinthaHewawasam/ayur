import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
} from '../validators/auth.validator.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.get('/me', authenticate, getProfile); // Alias for /profile
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

export default router;
