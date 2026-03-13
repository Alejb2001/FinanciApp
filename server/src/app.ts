import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import apiRouter from './routes/index';
import { errorHandler } from './middleware/error.middleware';
import { config } from './config/index';

mongoose
  .connect(config.mongoUri)
  .then(() => console.log('[db] MongoDB connected'))
  .catch((err) => console.error('[db] Connection error:', err));

const app = express();

// Security & logging middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', apiRouter);

// Global error handler (must be after routes)
app.use(errorHandler);

// Serve Angular static files in production
if (config.nodeEnv === 'production') {
  app.use(express.static(config.clientDistPath));

  // Catch-all: send index.html for Angular client-side routing
  app.get('*', (_req, res) => {
    res.sendFile(path.join(config.clientDistPath, 'index.html'));
  });
}

export default app;
