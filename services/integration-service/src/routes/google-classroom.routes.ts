/**
 * Google Classroom Integration Routes
 * OAuth flow and data sync endpoints
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { generateAuthUrl, getTokensFromCode, refreshAccessToken } from '../utils/oauth-helper';
import {
  fetchCourses,
  fetchStudents,
  fetchCourseWork,
  fetchSubmissions,
  syncAllCourses,
  mapAssignmentToGoal,
} from '../services/classroom-sync.service';
import { logger } from '../utils/logger';

export const googleClassroomRouter = Router();

/**
 * GET /api/integrations/google-classroom/auth-url
 * Generate OAuth authorization URL for user to connect Google Classroom
 */
googleClassroomRouter.get(
  '/auth-url',
  [query('userId').isUUID().withMessage('Valid user ID required')],
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

      const { userId } = req.query;

      // Generate state token (in production: store in Redis with expiry)
      const state = `${userId}-${Date.now()}`;

      const authUrl = generateAuthUrl(state);

      logger.info('Generated Google Classroom auth URL', { userId });

      res.json({
        success: true,
        data: {
          authUrl,
          state,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/integrations/google-classroom/callback
 * Handle OAuth callback and exchange code for tokens
 */
googleClassroomRouter.post(
  '/callback',
  [
    body('code').isString().notEmpty().withMessage('Authorization code required'),
    body('state').isString().notEmpty().withMessage('State token required'),
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

      const { code, state } = req.body;

      // In production: Verify state token from Redis
      logger.info('Processing OAuth callback', { state });

      // Exchange code for tokens
      const tokens = await getTokensFromCode(code);

      // In production: Store tokens in database
      // INSERT INTO integrations (user_id, provider, access_token, refresh_token, token_expires_at)

      logger.info('OAuth tokens obtained and stored', {
        hasRefreshToken: !!tokens.refresh_token,
      });

      res.json({
        success: true,
        data: {
          message: 'Google Classroom connected successfully',
          expiresAt: new Date(tokens.expiry_date).toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/integrations/google-classroom/courses
 * Fetch all courses for connected teacher
 */
googleClassroomRouter.get(
  '/courses',
  [query('userId').isUUID().withMessage('Valid user ID required')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.query;

      logger.info('Fetching Google Classroom courses', { userId });

      // In production: Get access token from database
      const accessToken = process.env.GOOGLE_ACCESS_TOKEN || '';

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'NOT_CONNECTED',
            message: 'Google Classroom not connected',
          },
        });
      }

      const courses = await fetchCourses(accessToken);

      res.json({
        success: true,
        data: {
          courses,
          count: courses.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/integrations/google-classroom/courses/:courseId/students
 * Fetch students in a course
 */
googleClassroomRouter.get(
  '/courses/:courseId/students',
  [
    param('courseId').isString().notEmpty().withMessage('Valid course ID required'),
    query('userId').isUUID().withMessage('Valid user ID required'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const { userId } = req.query;

      logger.info('Fetching students for course', { courseId, userId });

      // In production: Get access token from database
      const accessToken = process.env.GOOGLE_ACCESS_TOKEN || '';

      const students = await fetchStudents(accessToken, courseId);

      res.json({
        success: true,
        data: {
          students,
          count: students.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/integrations/google-classroom/courses/:courseId/coursework
 * Fetch assignments for a course
 */
googleClassroomRouter.get(
  '/courses/:courseId/coursework',
  [
    param('courseId').isString().notEmpty().withMessage('Valid course ID required'),
    query('userId').isUUID().withMessage('Valid user ID required'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const { userId } = req.query;

      logger.info('Fetching coursework for course', { courseId, userId });

      // In production: Get access token from database
      const accessToken = process.env.GOOGLE_ACCESS_TOKEN || '';

      const courseWork = await fetchCourseWork(accessToken, courseId);

      res.json({
        success: true,
        data: {
          coursework: courseWork,
          count: courseWork.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/integrations/google-classroom/courses/:courseId/coursework/:courseWorkId/submissions
 * Fetch student grades for an assignment
 */
googleClassroomRouter.get(
  '/courses/:courseId/coursework/:courseWorkId/submissions',
  [
    param('courseId').isString().notEmpty().withMessage('Valid course ID required'),
    param('courseWorkId').isString().notEmpty().withMessage('Valid coursework ID required'),
    query('userId').isUUID().withMessage('Valid user ID required'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, courseWorkId } = req.params;
      const { userId } = req.query;

      logger.info('Fetching submissions', { courseId, courseWorkId, userId });

      // In production: Get access token from database
      const accessToken = process.env.GOOGLE_ACCESS_TOKEN || '';

      const submissions = await fetchSubmissions(accessToken, courseId, courseWorkId);

      res.json({
        success: true,
        data: {
          submissions,
          count: submissions.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/integrations/google-classroom/sync
 * Manually trigger full sync of all classroom data
 */
googleClassroomRouter.post(
  '/sync',
  [body('userId').isUUID().withMessage('Valid user ID required')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;

      logger.info('Starting manual Google Classroom sync', { userId });

      // In production: Get access token from database
      const accessToken = process.env.GOOGLE_ACCESS_TOKEN || '';

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'NOT_CONNECTED',
            message: 'Google Classroom not connected',
          },
        });
      }

      const syncResults = await syncAllCourses(accessToken, userId as string);

      res.json({
        success: true,
        data: {
          message: 'Sync completed successfully',
          ...syncResults,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/integrations/google-classroom/map-assignment
 * Map a Google Classroom assignment to an IEP goal
 * This is the LOCK-IN feature - teachers invest time creating these mappings
 */
googleClassroomRouter.post(
  '/map-assignment',
  [
    body('courseId').isString().notEmpty().withMessage('Course ID required'),
    body('courseWorkId').isString().notEmpty().withMessage('Coursework ID required'),
    body('iepGoalId').isUUID().withMessage('Valid IEP goal ID required'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, courseWorkId, iepGoalId } = req.body;

      logger.info('Mapping assignment to IEP goal', {
        courseId,
        courseWorkId,
        iepGoalId,
      });

      await mapAssignmentToGoal(courseId, courseWorkId, iepGoalId);

      res.json({
        success: true,
        data: {
          message: 'Assignment mapped to IEP goal successfully',
          mapping: {
            courseId,
            courseWorkId,
            iepGoalId,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/integrations/google-classroom/disconnect
 * Disconnect Google Classroom integration
 */
googleClassroomRouter.delete(
  '/disconnect',
  [body('userId').isUUID().withMessage('Valid user ID required')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;

      logger.info('Disconnecting Google Classroom', { userId });

      // In production: Delete from integrations table
      // DELETE FROM integrations WHERE user_id = userId AND provider = 'google_classroom'

      res.json({
        success: true,
        data: {
          message: 'Google Classroom disconnected successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default googleClassroomRouter;
