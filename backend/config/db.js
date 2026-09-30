import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

let isConnected = false;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn('[Database Warning] MONGODB_URI is not defined in environment variables.');
    }
    const conn = await mongoose.connect(mongoUri || 'mongodb://127.0.0.1:27017/coinlift', {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    
    mongoose.connection.on('error', (err) => {
      console.warn(`[Database Warning] Mongo connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(`[Database Warning] Mongo disconnected.`);
    });

    console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] MongoDB connection failed: ${error.message}`);
    console.warn(`[Database Warning] Running API with fallback memory data mode for offline resilience.`);
    isConnected = false;
    return null;
  }
};

export const getIsConnected = () => isConnected;
