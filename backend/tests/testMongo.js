import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const testConnection = async () => {
  const uris = [
    process.env.MONGODB_URI,
    'mongodb+srv://jakasri1974_db_user:Abhi2006j@cluster0.1jymmly.mongodb.net/coinlift?retryWrites=true&w=majority',
    'mongodb+srv://jakasri1974_db_user:Abhi2006j@ac-weorio5-shard-00-00.1jymmly.mongodb.net/coinlift?retryWrites=true&w=majority'
  ];

  for (const uri of uris) {
    try {
      console.log('Testing URI:', uri.replace(/:([^@]+)@/, ':***@'));
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
      console.log('✅ Connected successfully to host:', conn.connection.host);
      await mongoose.disconnect();
      return;
    } catch (err) {
      console.log('❌ Failed:', err.message);
    }
  }
};

testConnection();
