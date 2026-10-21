import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

/**
 * Safely tests PostgreSQL database connection via Prisma
 * @returns {Promise<{ connected: boolean, message: string }>}
 */
export async function checkDbConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, message: 'PostgreSQL database connected via Prisma' };
  } catch (err) {
    return {
      connected: false,
      message: `Database connection failed: ${err.message || 'PostgreSQL port 5432 unreachable'}`,
    };
  }
}
