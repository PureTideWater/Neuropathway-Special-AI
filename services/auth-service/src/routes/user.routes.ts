/**
 * User Routes
 * User management endpoints
 */

import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { logger } from '../utils/logger';

export const userRouter = Router();

// Protect all user routes with JWT
userRouter.use(passport.authenticate('jwt', { session: false }));

/**
 * GET /api/users/me
 * Get current user profile
 */
userRouter.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;

    // In production, fetch full user data from database
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/me
 * Update current user profile
 */
userRouter.put('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const updates = req.body;

    // In production, update user in database
    logger.info('User profile updated', { userId: user.id });

    res.json({
      success: true,
      data: {
        message: 'Profile updated successfully',
        user: {
          ...user,
          ...updates,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/:id
 * Get user by ID (admin only in production)
 */
userRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // In production, check permissions and fetch from database
    res.json({
      success: true,
      data: {
        user: {
          id,
          email: 'user@example.com',
          role: 'teacher',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default userRouter;
