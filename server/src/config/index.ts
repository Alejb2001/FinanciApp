import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env['PORT'] || '3000', 10),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  mongoUri: process.env['MONGODB_URI'] || 'mongodb://localhost:27017/financiaapp',
  clientDistPath: path.join(__dirname, '..', '..', '..', 'client', 'dist', 'financiaapp-client', 'browser'),
};
