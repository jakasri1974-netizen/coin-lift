import app from './app.js';
import { checkDbConnection, prisma } from './config/db.js';
import { getJwtSecret } from './config/jwt.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Validate JWT configuration before listening
    getJwtSecret();

    // Start Express HTTP Server
    const server = app.listen(PORT, async () => {
      console.log(`==================================================`);
      console.log(`🚀 CrypLift Backend Server running on port ${PORT}`);
      console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`==================================================`);

      // Test Database Connection
      const dbStatus = await checkDbConnection();
      if (dbStatus.connected) {
        console.log(`✅ [Database Status]: ${dbStatus.message}`);
      } else {
        console.warn(`⚠️ [Database Warning]: ${dbStatus.message}`);
        console.warn(`📌 Note: Ensure PostgreSQL is running on localhost:5432 with DATABASE_URL in .env`);
      }
    });

    // Graceful Shutdown Handler
    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Server and Prisma database connection closed cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start CrypLift backend server:', error);
    process.exit(1);
  }
}

startServer();
