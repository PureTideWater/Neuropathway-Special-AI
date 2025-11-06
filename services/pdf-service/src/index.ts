import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { pdfRouter } from './routes/pdf.routes';
import { errorHandler } from './middleware/error-handler';

dotenv.config();

const app = express();
const PORT = process.env.PDF_SERVICE_PORT || 4005;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'pdf-service',
    timestamp: new Date().toISOString(),
    features: [
      'IEP PDF export',
      'Progress report PDF export',
      'Meeting report PDF export',
      'Custom branding support',
      'Multi-page IEP documents',
      'Chart/graph embedding',
    ],
  });
});

// Routes
app.use('/api/pdf', pdfRouter);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`PDF Service running on port ${PORT}`);
  logger.info('Features: IEP export, Progress reports, Meeting reports');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
