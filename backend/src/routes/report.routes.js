import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Placeholder routes for MVP
router.get('/daily', authorize('admin', 'doctor'), (req, res) => {
  res.json({ message: 'Daily report - Coming soon' });
});

router.get('/revenue', authorize('admin'), (req, res) => {
  res.json({ message: 'Revenue report - Coming soon' });
});

export default router;
