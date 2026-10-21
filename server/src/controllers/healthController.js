import { checkDbConnection } from '../config/db.js';

export async function getHealthStatus(req, res, next) {
  try {
    const dbStatus = await checkDbConnection();

    res.status(200).json({
      success: true,
      message: 'CoinLift API is running',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  } catch (error) {
    next(error);
  }
}
