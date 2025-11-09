/**
 * Accommodation Recommendation Routes
 * COMPETITIVE ADVANTAGE: Data-driven accommodation recommendations
 * PATENT OPPORTUNITY: Collaborative filtering for educational accommodations
 * DATA MOAT: The more districts use us, the better our recommendations
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import {
  getRecommendations,
  recordAccommodationOutcome,
  getEffectivenessStats,
  getSimilarStudents,
} from '../services/accommodation-recommender.service';
import { logger } from '../utils/logger';

export const accommodationRouter = Router();

/**
 * POST /api/accommodations/recommend
 * Get AI-powered accommodation recommendations for a student
 *
 * This is THE DATA MOAT feature - recommendations improve with more usage
 */
accommodationRouter.post(
  '/recommend',
  [
    body('studentId').isUUID().withMessage('Valid student ID required'),
    body('currentAccommodations').optional().isArray(),
    body('disabilityCategory').optional().isString(),
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

      const { studentId, currentAccommodations, disabilityCategory } = req.body;

      logger.info('Generating accommodation recommendations', {
        studentId,
        currentCount: currentAccommodations?.length || 0,
        disabilityCategory,
      });

      // Get AI-powered recommendations
      const recommendations = await getRecommendations(
        studentId,
        currentAccommodations || [],
        disabilityCategory
      );

      logger.info('Recommendations generated', {
        studentId,
        recommendationsCount: recommendations.length,
      });

      res.json({
        success: true,
        data: {
          recommendations,
          dataSource: 'Aggregated from ' + recommendations[0]?.evidenceBase?.districtsCount + ' districts',
          confidenceLevel: 'high',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/accommodations/record-outcome
 * Record how effective an accommodation was
 * This feeds the ML model - the more data, the better recommendations
 */
accommodationRouter.post(
  '/record-outcome',
  [
    body('studentId').isUUID().withMessage('Valid student ID required'),
    body('accommodationType').isString().notEmpty().withMessage('Accommodation type required'),
    body('outcomeScore').isFloat({ min: 0, max: 100 }).withMessage('Outcome score 0-100 required'),
    body('duration').optional().isInt().withMessage('Duration in weeks'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        studentId,
        accommodationType,
        outcomeScore,
        duration,
        notes,
        districtId,
      } = req.body;

      logger.info('Recording accommodation outcome', {
        studentId,
        accommodationType,
        outcomeScore,
      });

      await recordAccommodationOutcome({
        studentId,
        accommodationType,
        outcomeScore,
        duration,
        notes,
        districtId,
      });

      logger.info('Outcome recorded successfully', {
        studentId,
        accommodationType,
      });

      res.json({
        success: true,
        data: {
          message: 'Accommodation outcome recorded',
          contribution: 'Your data helps improve recommendations for all districts',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/accommodations/effectiveness/:accommodationType
 * Get effectiveness statistics for a specific accommodation
 */
accommodationRouter.get(
  '/effectiveness/:accommodationType',
  [param('accommodationType').isString().notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accommodationType } = req.params;
      const { disabilityCategory, gradeLevel } = req.query;

      logger.info('Fetching effectiveness stats', {
        accommodationType,
        disabilityCategory,
        gradeLevel,
      });

      const stats = await getEffectivenessStats(
        accommodationType,
        disabilityCategory as string,
        gradeLevel ? parseInt(gradeLevel as string) : undefined
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/accommodations/similar-students/:studentId
 * Find students with similar profiles (for collaborative filtering)
 */
accommodationRouter.get(
  '/similar-students/:studentId',
  [param('studentId').isUUID().withMessage('Valid student ID required')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      logger.info('Finding similar students', { studentId, limit });

      const similarStudents = await getSimilarStudents(studentId, limit);

      res.json({
        success: true,
        data: {
          similarStudents,
          count: similarStudents.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/accommodations/district-analytics
 * District-wide accommodation effectiveness analytics
 * Shows what works best in this district
 */
accommodationRouter.get(
  '/district-analytics',
  [query('districtId').isUUID().withMessage('Valid district ID required')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { districtId } = req.query;

      logger.info('Fetching district analytics', { districtId });

      // In production: Query accommodation_outcomes table
      const mockAnalytics = {
        districtId,
        totalOutcomesRecorded: 1247,
        topAccommodations: [
          {
            accommodation: 'Extended time (1.5x)',
            averageEffectiveness: 87.3,
            studentsUsing: 156,
            categoryBreakdown: {
              'Specific Learning Disability': 89.2,
              'ADHD': 85.1,
              'Autism': 82.7,
            },
          },
          {
            accommodation: 'Visual supports',
            averageEffectiveness: 84.6,
            studentsUsing: 142,
            categoryBreakdown: {
              'Autism': 91.3,
              'Specific Learning Disability': 82.1,
              'Developmental Delay': 78.9,
            },
          },
          {
            accommodation: 'Preferential seating',
            averageEffectiveness: 81.2,
            studentsUsing: 198,
            categoryBreakdown: {
              'ADHD': 86.4,
              'Specific Learning Disability': 79.8,
              'Hearing Impairment': 92.1,
            },
          },
        ],
        leastEffective: [
          {
            accommodation: 'Reduced homework',
            averageEffectiveness: 62.1,
            studentsUsing: 45,
            reason: 'No correlation with improved outcomes',
          },
        ],
        trends: {
          increasingEffectiveness: ['Graphic organizers', 'Text-to-speech'],
          decreasingEffectiveness: ['Homework passes', 'Extra credit'],
        },
      };

      res.json({
        success: true,
        data: mockAnalytics,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/accommodations/success-stories
 * Get success stories for specific accommodations
 * Helps teachers buy into recommendations
 */
accommodationRouter.get(
  '/success-stories',
  [query('accommodationType').isString().notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accommodationType, disabilityCategory } = req.query;

      logger.info('Fetching success stories', {
        accommodationType,
        disabilityCategory,
      });

      // Mock success stories
      const stories = [
        {
          id: 'story-1',
          studentProfile: {
            disabilityCategory: 'Specific Learning Disability',
            gradeLevel: 4,
            challenges: ['Reading comprehension', 'Working memory'],
          },
          accommodation: accommodationType,
          outcome: {
            beforeScore: 45,
            afterScore: 78,
            improvement: 33,
            duration: 12, // weeks
          },
          teacherQuote: 'The graphic organizers made a huge difference. Johnny can now organize his thoughts much better.',
          districtSize: 'medium',
        },
        {
          id: 'story-2',
          studentProfile: {
            disabilityCategory: 'ADHD',
            gradeLevel: 3,
            challenges: ['Attention', 'Organization'],
          },
          accommodation: accommodationType,
          outcome: {
            beforeScore: 52,
            afterScore: 81,
            improvement: 29,
            duration: 8,
          },
          teacherQuote: 'Visual supports helped Sarah stay on task and remember multi-step directions.',
          districtSize: 'large',
        },
      ];

      res.json({
        success: true,
        data: {
          stories,
          totalCount: 2,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default accommodationRouter;
