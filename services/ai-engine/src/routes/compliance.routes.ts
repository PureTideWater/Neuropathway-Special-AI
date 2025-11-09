/**
 * State Compliance Report Generator Routes
 * Validates IEPs against federal IDEA and state-specific requirements
 *
 * COMPETITIVE ADVANTAGE: Automated compliance reduces legal risk
 * BUSINESS VALUE: Districts pay premium for compliance automation
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import {
  checkIEPCompliance,
  generateComplianceReport,
  getComplianceHistory,
  getStateRequirements,
  bulkComplianceCheck,
} from '../services/compliance-checker.service';
import { logger } from '../utils/logger';

export const complianceRouter = Router();

/**
 * POST /api/compliance/check/:iepId
 * Check single IEP against state and federal requirements
 */
complianceRouter.post(
  '/check/:iepId',
  [
    param('iepId').isUUID().withMessage('Valid IEP ID required'),
    body('state').isString().isLength({ min: 2, max: 2 }).withMessage('Valid state code required (e.g., CA, TX)'),
    body('generatePDF').optional().isBoolean(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array(),
          },
        });
      }

      const { iepId } = req.params;
      const { state, generatePDF = false } = req.body;

      logger.info('Checking IEP compliance', { iepId, state });

      const complianceResult = await checkIEPCompliance(iepId, state, generatePDF);

      return res.json({
        success: true,
        data: complianceResult,
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * POST /api/compliance/report/:iepId
 * Generate comprehensive compliance report with AI analysis
 */
complianceRouter.post(
  '/report/:iepId',
  [
    param('iepId').isUUID().withMessage('Valid IEP ID required'),
    body('state').isString().isLength({ min: 2, max: 2 }).withMessage('Valid state code required'),
    body('includeRemediation').optional().isBoolean(),
    body('format').optional().isIn(['json', 'pdf', 'html']),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array(),
          },
        });
      }

      const { iepId } = req.params;
      const { state, includeRemediation = true, format = 'json' } = req.body;

      logger.info('Generating compliance report', { iepId, state, format });

      const report = await generateComplianceReport(iepId, state, includeRemediation, format);

      if (format === 'pdf') {
        return res.json({
          success: true,
          data: {
            pdfUrl: report.pdfUrl,
            reportId: report.reportId,
          },
        });
      }

      return res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /api/compliance/history/:iepId
 * Get compliance check history for an IEP
 */
complianceRouter.get(
  '/history/:iepId',
  [
    param('iepId').isUUID().withMessage('Valid IEP ID required'),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array(),
          },
        });
      }

      const { iepId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const history = await getComplianceHistory(iepId, limit);

      return res.json({
        success: true,
        data: {
          history,
          count: history.length,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /api/compliance/requirements/:state
 * Get specific state requirements and regulations
 */
complianceRouter.get(
  '/requirements/:state',
  [
    param('state').isString().isLength({ min: 2, max: 2 }).withMessage('Valid state code required'),
    query('category').optional().isString(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array(),
          },
        });
      }

      const { state } = req.params;
      const { category } = req.query;

      const requirements = await getStateRequirements(state, category as string);

      return res.json({
        success: true,
        data: {
          state,
          requirements,
          count: requirements.length,
          lastUpdated: new Date().toISOString(),
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * POST /api/compliance/bulk-check
 * Check compliance for multiple IEPs (district-wide audit)
 */
complianceRouter.post(
  '/bulk-check',
  [
    body('districtId').isUUID().withMessage('Valid district ID required'),
    body('state').isString().isLength({ min: 2, max: 2 }).withMessage('Valid state code required'),
    body('iepIds').optional().isArray().withMessage('IEP IDs must be an array'),
    body('includeAllActiveIEPs').optional().isBoolean(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array(),
          },
        });
      }

      const { districtId, state, iepIds, includeAllActiveIEPs = false } = req.body;

      logger.info('Starting bulk compliance check', {
        districtId,
        state,
        iepCount: iepIds?.length || 'all',
      });

      const bulkResults = await bulkComplianceCheck(
        districtId,
        state,
        iepIds,
        includeAllActiveIEPs
      );

      return res.json({
        success: true,
        data: bulkResults,
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /api/compliance/stats/:districtId
 * Get district-wide compliance statistics
 */
complianceRouter.get(
  '/stats/:districtId',
  [
    param('districtId').isUUID().withMessage('Valid district ID required'),
    query('state').isString().isLength({ min: 2, max: 2 }).withMessage('Valid state code required'),
    query('timeRange').optional().isIn(['7d', '30d', '90d', '1y']),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: errors.array(),
          },
        });
      }

      const { districtId } = req.params;
      const { state, timeRange = '30d' } = req.query;

      // In production: Query database for stats
      const stats = {
        districtId,
        state,
        timeRange,
        totalIEPs: 450,
        compliantIEPs: 423,
        complianceRate: 94.0,
        criticalIssues: 12,
        warnings: 35,
        commonViolations: [
          { rule: 'PLOP_MISSING', count: 8, severity: 'critical' },
          { rule: 'GOAL_MEASURABILITY', count: 15, severity: 'warning' },
          { rule: 'PARENT_NOTICE_TIMELINE', count: 7, severity: 'warning' },
        ],
        trend: 'improving',
        previousComplianceRate: 91.5,
      };

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      return next(error);
    }
  }
);

export default complianceRouter;
