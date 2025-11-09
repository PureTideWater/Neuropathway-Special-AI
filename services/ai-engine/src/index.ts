/**
 * PathWise AI Engine
 * Handles LLM-powered IEP generation, adaptive learning recommendations, and AI operations
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { iepGeneratorRouter } from './routes/iep-generator.routes';
import { adaptiveLearningRouter } from './routes/adaptive-learning.routes';
import { predictionRouter } from './routes/prediction.routes';
import { transcriptionRouter } from './routes/transcription.routes';
import { accommodationRouter } from './routes/accommodation.routes';
import { translationRouter } from './routes/translation.routes';
import { errorHandler } from './middleware/error-handler';

dotenv.config();

const app: Application = express();
const PORT = process.env.AI_ENGINE_PORT || 4004;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'ai-engine',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/iep-generator', iepGeneratorRouter);
app.use('/api/adaptive-learning', adaptiveLearningRouter);
app.use('/api/predictions', predictionRouter); // COMPETITIVE MOAT: Goal progress prediction ML
app.use('/api/transcription', transcriptionRouter); // PATENT OPPORTUNITY: Meeting minutes with AI
app.use('/api/accommodations', accommodationRouter); // DATA MOAT: Collaborative filtering recommendations
app.use('/api/translation', translationRouter); // MARKET EXPANSION: 10 languages for parent communication

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
    },
  });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`AI Engine running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Primary AI Model: ${process.env.AI_MODEL_PRIMARY || 'gpt-4o'}`);
});

export default app;
