/**
 * Goal Progress Prediction Routes
 * COMPETITIVE ADVANTAGE: Predict IEP goal achievement 4-6 weeks in advance
 * PATENT OPPORTUNITY: Novel ML application to special education compliance
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { predictGoalOutcome, getPredictionHistory, analyzePredictionFactors } from '../services/goal-prediction.service';
import { logger } from '../utils/logger';

export const predictionRouter = Router();

/**
 * POST /api/predictions/goal/:goalId
 * Predict if student will meet IEP goal by target date
 *
 * Response example:
 * {
 *   "predicted_outcome": "at_risk",
 *   "confidence": 73.5,
 *   "days_until_target": 45,
 *   "factors": {
 *     "negative": ["Declining progress trend", "Low attendance"],
 *     "positive": ["Consistent accommodation usage", "Engaged parents"]
 *   },
 *   "recommended_interventions": [
 *     "Schedule intervention meeting within 2 weeks",
 *     "Increase service frequency to 4x/week",
 *     "Add visual supports accommodation"
 *   ]
 * }
 */
predictionRouter.post(
  '/goal/:goalId',
  [param('goalId').isUUID().withMessage('Valid goal ID required')],
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

      const { goalId } = req.params;

      logger.info('Predicting goal outcome', { goalId });

      const prediction = await predictGoalOutcome(goalId);

      // Alert if high risk
      if (prediction.predicted_outcome === 'at_risk' && prediction.confidence > 70) {
        logger.warn('High-risk goal detected', {
          goalId,
          confidence: prediction.confidence,
          daysUntilTarget: prediction.days_until_target,
        });

        // In production: Trigger automated alert to teacher/admin
      }

      logger.info('Goal prediction completed', {
        goalId,
        outcome: prediction.predicted_outcome,
        confidence: prediction.confidence,
      });

      res.json({
        success: true,
        data: prediction,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/predictions/goal/:goalId/history
 * Get historical predictions for a goal (track accuracy over time)
 */
predictionRouter.get(
  '/goal/:goalId/history',
  [param('goalId').isUUID().withMessage('Valid goal ID required')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { goalId } = req.params;

      logger.info('Fetching prediction history', { goalId });

      const history = await getPredictionHistory(goalId);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/predictions/goals/at-risk
 * Get all goals at risk across all students (for compliance dashboard)
 */
predictionRouter.get(
  '/goals/at-risk',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { districtId, threshold = 70 } = req.query;

      logger.info('Fetching at-risk goals', {
        districtId,
        confidenceThreshold: threshold,
      });

      // In production: Query database view `goals_at_risk`
      const atRiskGoals = [
        {
          goalId: 'goal-uuid-1',
          studentName: 'Sarah Johnson',
          goalDomain: 'Reading Comprehension',
          targetDate: '2025-06-30',
          daysRemaining: 42,
          confidence: 78.5,
          predictedOutcome: 'at_risk',
          teacherName: 'Ms. Rodriguez',
        },
        {
          goalId: 'goal-uuid-2',
          studentName: 'Michael Chen',
          goalDomain: 'Math Problem Solving',
          targetDate: '2025-06-30',
          daysRemaining: 42,
          confidence: 82.3,
          predictedOutcome: 'at_risk',
          teacherName: 'Mr. Thompson',
        },
      ];

      res.json({
        success: true,
        data: {
          totalAtRisk: atRiskGoals.length,
          goals: atRiskGoals,
          threshold: Number(threshold),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/predictions/analyze-factors
 * Deep dive into what factors are affecting goal progress
 * This helps teachers understand WHY a prediction was made
 */
predictionRouter.post(
  '/analyze-factors',
  [body('goalId').isUUID().withMessage('Valid goal ID required')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { goalId } = req.body;

      logger.info('Analyzing prediction factors', { goalId });

      const analysis = await analyzePredictionFactors(goalId);

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/predictions/batch-predict
 * Predict outcomes for all goals in an IEP at once
 * Used for IEP review meetings
 */
predictionRouter.post(
  '/batch-predict',
  [body('iepId').isUUID().withMessage('Valid IEP ID required')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { iepId } = req.body;

      logger.info('Batch predicting IEP goals', { iepId });

      // In production: Fetch all goals for IEP, predict each one
      const predictions = {
        iepId,
        totalGoals: 5,
        predictions: [
          {
            goalDomain: 'Reading',
            outcome: 'will_meet',
            confidence: 87.2,
          },
          {
            goalDomain: 'Math',
            outcome: 'will_meet',
            confidence: 92.5,
          },
          {
            goalDomain: 'Writing',
            outcome: 'at_risk',
            confidence: 73.1,
          },
          {
            goalDomain: 'Social Skills',
            outcome: 'will_meet',
            confidence: 81.0,
          },
          {
            goalDomain: 'Attention',
            outcome: 'at_risk',
            confidence: 68.4,
          },
        ],
        summary: {
          goalsOnTrack: 3,
          goalsAtRisk: 2,
          overallConfidence: 80.4,
        },
      };

      res.json({
        success: true,
        data: predictions,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default predictionRouter;
