/**
 * Centralized API Error Handling Middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('[CrypLift API Error]:', err);

  if (err.name === 'ZodError' || err.errors || err.issues) {
    const issues = err.errors || err.issues;
    const errorMessages = issues && Array.isArray(issues) ? issues.map((e) => e.message).join(', ') : err.message;
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: errorMessages,
        details: issues,
      },
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected server error occurred';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
    },
  });
}

/**
 * 404 Not Found Middleware
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    },
  });
}
