/**
 * PathWise Integration Service
 * Handles third-party integrations: Google Classroom, Canvas, Schoology
 *
 * COMPETITIVE ADVANTAGE: Creates lock-in through assignment-to-IEP-goal mappings
 * BUSINESS VALUE: Teachers can't leave once they've invested time in mappings
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { googleClassroomRouter } from './routes/google-classroom.routes';
import { errorHandler } from './middleware/error-handler';

dotenv.config();

const app: Application = express();
const PORT = process.env.INTEGRATION_SERVICE_PORT || 4006;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'integration-service',
    timestamp: new Date().toISOString(),
    integrations: [
      'Google Classroom (OAuth + Grade Sync)',
      'Canvas LMS (planned)',
      'Schoology (planned)',
    ],
  });
});

// API routes
app.use('/api/integrations/google-classroom', googleClassroomRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Integration Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('🔗 Google Classroom integration ready - LOCK-IN FEATURE');
});

export default app;
