import express from 'express';
import { getSystemSettings, updateSystemSettings } from '../controllers/settings.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// System settings routes
router.get('/system', getSystemSettings);
router.put('/system', updateSystemSettings);

export default router;
