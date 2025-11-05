import { AppError } from '../domain/errors/index.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('Error occurred:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    body: req.body,
    user: req.user?.id
  });
  
  // Operational errors (known errors)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.name,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
  
  // Programming errors or unknown errors
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'An unexpected error occurred'
    });
  }
  
  // In development, send full error details
  res.status(500).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message,
    stack: err.stack
  });
};

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `Route ${req.method} ${req.url} not found`
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
