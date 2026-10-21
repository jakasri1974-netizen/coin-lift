import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { getJwtSecret } from '../config/jwt.js';

/**
 * Middleware: Verifies Bearer JWT token and attaches authenticated user to req.user
 */
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token required. Header format must be "Authorization: Bearer <token>"',
        },
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());

    // Verify user exists and check account status
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User associated with this token no longer exists' },
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended' },
      });
    }

    // Attach authenticated user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Authentication token has expired. Please log in again.' },
      });
    }
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid authentication token' },
    });
  }
}

/**
 * Middleware: Restricts route access to specified User Roles
 * @param {...string} allowedRoles
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Forbidden: Access requires one of the following roles: [${allowedRoles.join(', ')}]`,
        },
      });
    }

    next();
  };
}

/**
 * Middleware: Optionally verifies Bearer JWT token if present.
 * Does not fail if header is missing, allowing public routes to check req.user if present.
 */
export async function optionalAuthToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true, role: true, status: true },
      });
      if (user && user.status !== 'SUSPENDED') {
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid tokens for optional auth
  }
  next();
}
