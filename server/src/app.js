import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getJwtSecret } from './config/jwt.js';
import apiRoutes from './routes/apiRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Enforce mandatory JWT configuration before accepting requests
getJwtSecret();

const app = express();

// Express Configuration & Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Mount Master API Router
app.use('/api', apiRoutes);

// Root Fallback Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CrypLift API Foundation Gateway',
    documentation: '/api/health',
  });
});

// 404 Not Found Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
