import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

// Verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const result = await pool.query(
      `SELECT id, clinic_id, name, email, role, is_active
       FROM users
       WHERE id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'User account is inactive'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Token expired'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
};

// Check user role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: `This action requires one of the following roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Check if user belongs to the same clinic
export const checkClinicAccess = async (req, res, next) => {
  try {
    const { clinic_id } = req.params;

    if (req.user.role !== 'admin' && req.user.clinic_id !== parseInt(clinic_id)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access data from your clinic'
      });
    }

    next();
  } catch (error) {
    console.error('Clinic access check error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Access check failed'
    });
  }
};

export default { authenticate, authorize, checkClinicAccess };
