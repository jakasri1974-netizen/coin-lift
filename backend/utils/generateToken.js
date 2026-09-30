import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'coinlift_secure_jwt_secret_key_2026_production_safe', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

export default generateToken;
