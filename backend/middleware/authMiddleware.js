import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'coinlift_secure_jwt_secret_key_2026_production_safe'
      );

      if (getIsConnected()) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        req.user = memoryStore.users.find(u => u._id === decoded.id);
        if (req.user) {
          const { password, ...userWithoutPassword } = req.user;
          req.user = userWithoutPassword;
        }
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found',
        });
      }

      return next();
    } catch (error) {
      console.error('[Auth Error]', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};
