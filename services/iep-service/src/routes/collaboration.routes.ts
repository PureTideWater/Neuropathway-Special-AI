/**
 * Collaborative IEP Editor Routes
 * Real-time collaborative editing with WebSocket support
 *
 * COMPETITIVE ADVANTAGE: Google Docs-style collaboration for IEPs
 * BUSINESS VALUE: Reduces meeting time, enables async collaboration
 * TECHNICAL: Uses WebSockets + Operational Transformation
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import {
  getActiveCollaborators,
  getComments,
  addComment,
  resolveComment,
  getRevisionHistory,
  getRevisionDiff,
  restoreRevision,
  lockSection,
  unlockSection,
  getSectionLocks,
} from '../services/collaboration.service';
import { logger } from '../utils/logger';

export const collaborationRouter = Router();

/**
 * GET /api/collaboration/:iepId/collaborators
 * Get list of active collaborators on an IEP
 */
collaborationRouter.get(
  '/:iepId/collaborators',
  [param('iepId').isUUID().withMessage('Valid IEP ID required')],
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

      const collaborators = await getActiveCollaborators(iepId);

      return res.json({
        success: true,
        data: {
          collaborators,
          count: collaborators.length,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /api/collaboration/:iepId/comments
 * Get all comments on an IEP
 */
collaborationRouter.get(
  '/:iepId/comments',
  [
    param('iepId').isUUID().withMessage('Valid IEP ID required'),
    query('section').optional().isString(),
    query('resolved').optional().isBoolean(),
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
      const { section, resolved } = req.query;

      const comments = await getComments(
        iepId,
        section as string,
        resolved === 'true'
      );

      return res.json({
        success: true,
        data: {
          comments,
          count: comments.length,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * POST /api/collaboration/:iepId/comments
 * Add a comment to an IEP section
 */
collaborationRouter.post(
  '/:iepId/comments',
  [
    param('iepId').isUUID().withMessage('Valid IEP ID required'),
    body('section').isString().notEmpty().withMessage('Section required'),
    body('content').isString().notEmpty().withMessage('Comment content required'),
    body('userId').isUUID().withMessage('Valid user ID required'),
    body('mentionedUsers').optional().isArray(),
    body('range').optional().isObject(),
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
      const { section, content, userId, mentionedUsers, range } = req.body;

      const comment = await addComment(
        iepId,
        section,
        content,
        userId,
        mentionedUsers,
        range
      );

      return res.json({
        success: true,
        data: comment,
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * PATCH /api/collaboration/comments/:commentId/resolve
 * Mark a comment as resolved
 */
collaborationRouter.patch(
  '/comments/:commentId/resolve',
  [
    param('commentId').isUUID().withMessage('Valid comment ID required'),
    body('resolvedBy').isUUID().withMessage('Valid user ID required'),
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

      const { commentId } = req.params;
      const { resolvedBy } = req.body;

      const comment = await resolveComment(commentId, resolvedBy);

      return res.json({
        success: true,
        data: comment,
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /api/collaboration/:iepId/revisions
 * Get revision history for an IEP
 */
collaborationRouter.get(
  '/:iepId/revisions',
  [
    param('iepId').isUUID().withMessage('Valid IEP ID required'),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('section').optional().isString(),
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
      const { section } = req.query;

      const revisions = await getRevisionHistory(iepId, limit, section as string);

      return res.json({
        success: true,
        data: {
          revisions,
          count: revisions.length,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /api/collaboration/revisions/:revisionId/diff
 * Get diff between two revisions
 */
collaborationRouter.get(
  '/revisions/:revisionId/diff',
  [
    param('revisionId').isUUID().withMessage('Valid revision ID required'),
    query('compareWith').optional().isUUID(),
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

      const { revisionId } = req.params;
      const { compareWith } = req.query;

      const diff = await getRevisionDiff(revisionId, compareWith as string);

      return res.json({
        success: true,
        data: diff,
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * POST /api/collaboration/revisions/:revisionId/restore
 * Restore an IEP to a previous revision
 */
collaborationRouter.post(
  '/revisions/:revisionId/restore',
  [
    param('revisionId').isUUID().withMessage('Valid revision ID required'),
    body('userId').isUUID().withMessage('Valid user ID required'),
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

      const { revisionId } = req.params;
      const { userId } = req.body;

      const restoredIep = await restoreRevision(revisionId, userId);

      return res.json({
        success: true,
        data: restoredIep,
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * POST /api/collaboration/:iepId/lock
 * Lock a section for exclusive editing
 */
collaborationRouter.post(
  '/:iepId/lock',
  [
    param('iepId').isUUID().withMessage('Valid IEP ID required'),
    body('section').isString().notEmpty().withMessage('Section required'),
    body('userId').isUUID().withMessage('Valid user ID required'),
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
      const { section, userId } = req.body;

      const lock = await lockSection(iepId, section, userId);

      return res.json({
        success: true,
        data: lock,
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * DELETE /api/collaboration/:iepId/lock/:section
 * Unlock a section
 */
collaborationRouter.delete(
  '/:iepId/lock/:section',
  [
    param('iepId').isUUID().withMessage('Valid IEP ID required'),
    param('section').isString().notEmpty().withMessage('Section required'),
    query('userId').isUUID().withMessage('Valid user ID required'),
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

      const { iepId, section } = req.params;
      const { userId } = req.query;

      await unlockSection(iepId, section, userId as string);

      return res.json({
        success: true,
        message: 'Section unlocked',
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /api/collaboration/:iepId/locks
 * Get all active locks for an IEP
 */
collaborationRouter.get(
  '/:iepId/locks',
  [param('iepId').isUUID().withMessage('Valid IEP ID required')],
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

      const locks = await getSectionLocks(iepId);

      return res.json({
        success: true,
        data: {
          locks,
          count: locks.length,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

export default collaborationRouter;
