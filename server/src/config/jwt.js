import dotenv from 'dotenv';

// Ensure environment variables are loaded if imported directly
dotenv.config();

const KNOWN_INSECURE_FALLBACKS = [
  'your-super-secret-jwt-key-here',
  'coinlift_super_secret_jwt_key_2026_production_secure',
  'replace_with_secure_production_jwt_secret_2026',
];

/**
 * Validates and retrieves the JWT_SECRET from environment variables.
 * Enforces that JWT_SECRET is present, non-empty, and non-whitespace.
 * Prevents starting in production with known development/example secrets.
 * Throws a descriptive error if invalid or missing.
 * @returns {string} The validated JWT secret.
 */
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || typeof secret !== 'string' || !secret.trim()) {
    throw new Error('JWT_SECRET environment variable is required and cannot be empty or whitespace.');
  }

  const trimmedSecret = secret.trim();

  if (process.env.NODE_ENV === 'production' && KNOWN_INSECURE_FALLBACKS.includes(trimmedSecret)) {
    throw new Error('JWT_SECRET cannot use a known default or example secret in production.');
  }

  return trimmedSecret;
}

/**
 * Retrieves the JWT_EXPIRES_IN setting from environment variables.
 * Defaults to '1d' if not specified.
 * @returns {string} The token expiration duration.
 */
export function getJwtExpiresIn() {
  const expiresIn = process.env.JWT_EXPIRES_IN;
  if (!expiresIn || typeof expiresIn !== 'string' || !expiresIn.trim()) {
    return '1d';
  }
  return expiresIn.trim();
}
