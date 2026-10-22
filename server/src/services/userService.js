import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { getJwtSecret, getJwtExpiresIn } from '../config/jwt.js';

export const userService = {
  /**
   * Register a new CREATOR or PROJECT_OWNER user
   */
  async register(data) {
    const { name, email, password, role } = data;

    // Check duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const error = new Error('A user with this email address already exists');
      error.statusCode = 409;
      error.code = 'DUPLICATE_EMAIL';
      throw error;
    }

    // Hash password securely with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'CREATOR',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, getJwtSecret(), {
      expiresIn: getJwtExpiresIn(),
    });

    return { user, token };
  },

  /**
   * Authenticate user & issue JWT
   */
  async login({ email, password }) {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Check Account Status
    if (user.status === 'SUSPENDED') {
      const error = new Error('Your account has been suspended. Please contact platform support.');
      error.statusCode = 403;
      error.code = 'ACCOUNT_SUSPENDED';
      throw error;
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, role: user.role }, getJwtSecret(), {
      expiresIn: getJwtExpiresIn(),
    });

    // Return sanitized user object
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { user: safeUser, token };
  },

  /**
   * Fetch authenticated user profile details by User ID
   */
  async getUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        creatorProfile: true,
        projectProfile: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
