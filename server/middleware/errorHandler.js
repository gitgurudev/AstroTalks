// File: server/middleware/errorHandler.js

/**
 * Global Express error handler.
 * Catches any error passed via next(err) and returns a clean JSON response.
 */
export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path} —`, err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error.',
  });
}
