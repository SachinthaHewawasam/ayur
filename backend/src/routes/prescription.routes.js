import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Placeholder routes for MVP
router.get('/', (req, res) => {
  res.json({ message: 'Get prescriptions - Coming soon' });
});

router.post('/', authorize('doctor', 'admin'), (req, res) => {
  res.json({ message: 'Create prescription - Coming soon' });
});

export default router;
