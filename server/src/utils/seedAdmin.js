import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';

// Ensure environment variables are loaded if invoked directly via CLI
dotenv.config();

export async function seedInitialAdmin() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL?.trim() || 'admin@cryplift.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  if (!adminPassword || !adminPassword.trim()) {
    throw new Error('ADMIN_SEED_PASSWORD environment variable is required to seed an admin account.');
  }

  try {
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: adminEmail },
          { role: 'ADMIN' },
        ],
      },
    });

    if (existingAdmin) {
      console.log(`ℹ️ [Admin Seed]: Admin user already exists (${existingAdmin.email})`);
      return existingAdmin;
    }

    const passwordHash = await bcrypt.hash(adminPassword.trim(), 10);

    const admin = await prisma.user.create({
      data: {
        name: 'CrypLift Platform Admin',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    console.log(`✅ [Admin Seed]: Initial Admin account created successfully! (${adminEmail})`);
    return admin;
  } catch (err) {
    console.warn(`⚠️ [Admin Seed Warning]: Could not seed admin user automatically (${err.message}). Database connection may be pending.`);
    return null;
  }
}

// Standalone execution if run directly via CLI (npm run seed:admin)
if (process.argv[1]?.endsWith('seedAdmin.js')) {
  seedInitialAdmin()
    .then((admin) => {
      process.exit(admin ? 0 : 1);
    })
    .catch((err) => {
      console.error(`❌ [Admin Seed Error]: ${err.message}`);
      process.exit(1);
    });
}
