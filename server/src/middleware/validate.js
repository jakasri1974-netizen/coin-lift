/**
 * Express middleware runner for Zod schema validation
 * @param {import('zod').ZodSchema} schema
 */
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    const issues = error.errors || error.issues;
    if (issues && Array.isArray(issues)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: issues.map((e) => e.message).join(', ') || 'Invalid request payload',
          details: issues.map((e) => ({
            field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
            message: e.message,
          })),
        },
      });
    }
    next(error);
  }
};
