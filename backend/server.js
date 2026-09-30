import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { connectDB, getIsConnected } from './config/db.js';
import { seedDatabase } from './utils/seedDatabase.js';
import { initSocketServer } from './sockets/socketServer.js';

import authRoutes from './routes/authRoutes.js';
import creatorRoutes from './routes/creatorRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import discoverRoutes from './routes/discoverRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import agreementRoutes from './routes/agreementRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO Server
initSocketServer(httpServer);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS middleware
const allowedOrigins = process.env.CLIENT_URL || process.env.CORS_ORIGIN;
app.use(cors({
  origin: allowedOrigins
    ? (allowedOrigins.includes(',') ? allowedOrigins.split(',').map(s => s.trim()) : allowedOrigins)
    : '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  skip: (req) => req.headers['x-test-bypass'] === 'true' || process.env.NODE_ENV === 'test',
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api', limiter);

// Request body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CrypLift API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/payments', paymentRoutes);


// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Database & Server
const startServer = async () => {
  await connectDB();
  if (getIsConnected()) {
    await seedDatabase();
  }

  httpServer.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 CrypLift Real-time API & Socket.IO Server on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`==================================================`);
  });
};

startServer();

export default app;
