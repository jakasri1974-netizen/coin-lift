import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const socketAuthMiddleware = (socket, next) => {
  try {
    let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (token && token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    if (!token) {
      const err = new Error('Authentication token missing');
      err.data = { code: 'UNAUTHORIZED' };
      return next(err);
    }

    const secret = process.env.JWT_SECRET || 'coinlift_secret_key';
    const decoded = jwt.verify(token, secret);

    if (!decoded || !decoded.id) {
      const err = new Error('Invalid authentication token');
      err.data = { code: 'UNAUTHORIZED' };
      return next(err);
    }

    // Attach authenticated user information
    socket.user = {
      _id: decoded.id.toString(),
      role: decoded.role || 'user',
    };

    next();
  } catch (err) {
    const error = new Error('Authentication failed: ' + err.message);
    error.data = { code: 'UNAUTHORIZED' };
    return next(error);
  }
};
