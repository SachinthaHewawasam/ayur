import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Placeholder routes for MVP
router.get('/', (req, res) => {
  res.json({ message: 'Get bills - Coming soon' });
});

router.post('/', authorize('receptionist', 'admin'), (req, res) => {
  res.json({ message: 'Create bill - Coming soon' });
});

export default router;
