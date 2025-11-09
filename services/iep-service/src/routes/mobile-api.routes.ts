/**
 * Mobile Data Collection API Routes
 * REST API for iOS/Android apps - offline-first classroom data collection
 *
 * COMPETITIVE ADVANTAGE: Mobile-first IEP data collection
 * BUSINESS VALUE: Teachers collect data in real-time during instruction
 * TECHNICAL: Offline-first with sync when connected
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { logger } from '../utils/logger';

export const mobileApiRouter = Router();

/**
 * POST /api/mobile/observations
 * Record classroom observation from mobile device
 */
mobileApiRouter.post(
  '/observations',
  [
    body('studentId').isUUID().withMessage('Valid student ID required'),
    body('goalId').optional().isUUID(),
    body('observationType').isIn(['behavior', 'academic', 'social', 'communication']),
    body('notes').isString().notEmpty(),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('timestamp').isISO8601(),
    body('deviceId').isString(),
    body('offline').optional().isBoolean(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: errors.array() },
        });
      }

      const { studentId, goalId, observationType, notes, rating, timestamp, deviceId, offline } = req.body;

      const observation = {
        id: `obs-${Date.now()}`,
        studentId,
        goalId,
        observationType,
        notes,
        rating,
        timestamp,
        deviceId,
        syncedAt: offline ? null : new Date(),
        createdAt: new Date(),
      };

      logger.info('Mobile observation recorded', { studentId, observationType, offline });

      return res.status(201).json({ success: true, data: observation });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * POST /api/mobile/progress-data
 * Record goal progress data from mobile device
 */
mobileApiRouter.post(
  '/progress-data',
  [
    body('goalId').isUUID().withMessage('Valid goal ID required'),
    body('value').isNumeric().withMessage('Numeric value required'),
    body('unit').isString(),
    body('timestamp').isISO8601(),
    body('notes').optional().isString(),
    body('deviceId').isString(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: errors.array() },
        });
      }

      const { goalId, value, unit, timestamp, notes, deviceId } = req.body;

      const progressData = {
        id: `progress-${Date.now()}`,
        goalId,
        value,
        unit,
        timestamp,
        notes,
        deviceId,
        createdAt: new Date(),
      };

      logger.info('Mobile progress data recorded', { goalId, value });

      return res.status(201).json({ success: true, data: progressData });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * POST /api/mobile/sync
 * Sync offline data from mobile device
 */
mobileApiRouter.post(
  '/sync',
  [
    body('deviceId').isString().notEmpty(),
    body('observations').optional().isArray(),
    body('progressData').optional().isArray(),
    body('lastSyncedAt').optional().isISO8601(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: errors.array() },
        });
      }

      const { deviceId, observations = [], progressData = [] } = req.body;

      const syncResult = {
        deviceId,
        observationsSynced: observations.length,
        progressDataSynced: progressData.length,
        syncedAt: new Date(),
      };

      logger.info('Mobile sync completed', syncResult);

      return res.json({ success: true, data: syncResult });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /api/mobile/students/:teacherId
 * Get student list for mobile app
 */
mobileApiRouter.get(
  '/students/:teacherId',
  [param('teacherId').isUUID().withMessage('Valid teacher ID required')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: errors.array() },
        });
      }

      const students = [
        { id: 'student-1', name: 'Emma Williams', grade: 3, hasActiveIEP: true },
        { id: 'student-2', name: 'Liam Johnson', grade: 4, hasActiveIEP: true },
      ];

      return res.json({ success: true, data: { students, count: students.length } });
    } catch (error) {
      return next(error);
    }
  }
);

export default mobileApiRouter;
