import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

/**
 * Get all users in the clinic
 * GET /api/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        id, name, email, phone, role, specialization, 
        is_active, created_at
      FROM users
      WHERE clinic_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [req.user.clinic_id]);
    
    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id, name, email, phone, role, specialization, 
        is_active, created_at
      FROM users
      WHERE id = $1 AND clinic_id = $2
    `;
    
    const result = await pool.query(query, [id, req.user.clinic_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user
 * POST /api/users
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, phone, role, specialization, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required'
      });
    }
    
    // Check if email already exists
    const checkQuery = 'SELECT id FROM users WHERE email = $1';
    const checkResult = await pool.query(checkQuery, [email]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const query = `
      INSERT INTO users (
        clinic_id, name, email, phone, role, 
        specialization, password, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING id, name, email, phone, role, specialization, is_active, created_at
    `;
    
    const values = [
      req.user.clinic_id,
      name,
      email,
      phone || null,
      role,
      specialization || null,
      hashedPassword
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 * PUT /api/users/:id
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, specialization } = req.body;
    
    // Check if user exists and belongs to clinic
    const checkQuery = 'SELECT id FROM users WHERE id = $1 AND clinic_id = $2';
    const checkResult = await pool.query(checkQuery, [id, req.user.clinic_id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user
    const query = `
      UPDATE users
      SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = $3,
        role = COALESCE($4, role),
        specialization = $5
      WHERE id = $6 AND clinic_id = $7
      RETURNING id, name, email, phone, role, specialization, is_active, created_at
    `;
    
    const values = [
      name,
      email,
      phone || null,
      role,
      specialization || null,
      id,
      req.user.clinic_id
    ];
    
    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user exists and belongs to clinic
    const checkQuery = 'SELECT id, role FROM users WHERE id = $1 AND clinic_id = $2';
    const checkResult = await pool.query(checkQuery, [id, req.user.clinic_id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent deleting admin users
    if (checkResult.rows[0].role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }
    
    // Soft delete by setting is_active to false
    const query = `
      UPDATE users
      SET is_active = false
      WHERE id = $1 AND clinic_id = $2
    `;
    
    await pool.query(query, [id, req.user.clinic_id]);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
