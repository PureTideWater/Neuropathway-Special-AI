/**
 * PathWise IEP Service
 * Complete IEP management system with AI-powered features
 * This is our killer feature - what MagicSchool doesn't have
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { iepRouter } from './routes/iep.routes';
import { goalRouter } from './routes/goal.routes';
import { progressRouter } from './routes/progress.routes';
import { complianceRouter } from './routes/compliance.routes';
import { templateRouter } from './routes/template.routes';
import { collaborationRouter } from './routes/collaboration.routes';
import { mobileApiRouter } from './routes/mobile-api.routes';
import { marketplaceRouter } from './routes/marketplace.routes';
import { roiDashboardRouter } from './routes/roi-dashboard.routes';
import { errorHandler } from './middleware/error-handler';

dotenv.config();

const app: Application = express();
const PORT = process.env.IEP_SERVICE_PORT || 4002;

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
    service: 'iep-service',
    timestamp: new Date().toISOString(),
    features: [
      'IEP CRUD operations',
      'Real-time compliance checking',
      'Progress monitoring',
      'AI-powered goal suggestions',
      'Bulk operations',
      'Template management'
    ]
  });
});

// API routes - The features that beat MagicSchool
app.use('/api/ieps', iepRouter);              // Complete IEP management
app.use('/api/goals', goalRouter);             // Goal tracking & AI suggestions
app.use('/api/progress', progressRouter);      // Progress monitoring (killer feature)
app.use('/api/compliance', complianceRouter);  // State compliance checking (unique to us)
app.use('/api/templates', templateRouter);     // Smart templates that learn (AI-powered)
app.use('/api/collaboration', collaborationRouter); // FEATURE #11: Google Docs-style collaboration
app.use('/api/mobile', mobileApiRouter);       // FEATURE #12: Mobile data collection (offline-first)
app.use('/api/marketplace', marketplaceRouter); // FEATURE #13: Template marketplace with revenue share
app.use('/api/roi', roiDashboardRouter);       // FEATURE #14: ROI dashboard for renewals

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
  logger.info(`IEP Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('✨ PathWise IEP Service - The MagicSchool Killer ✨');
});

export default app;
