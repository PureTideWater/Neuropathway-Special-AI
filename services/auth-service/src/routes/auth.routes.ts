/**
 * Authentication Routes
 * Handles login, OAuth callbacks, token generation
 */

import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger';
import { ValidationError } from '../middleware/error-handler';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate JWT token
 */
function generateToken(user: any): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'teacher',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * POST /api/auth/login
 * Email/password login (for development)
 */
authRouter.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError('Validation failed');
      }

      const { email, password } = req.body;

      // In production, verify credentials against database
      // For MVP, accept any email/password combination
      const user = {
        id: '10000000-0000-0000-0000-000000000001',
        email,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'teacher',
      };

      const token = generateToken(user);

      logger.info('User logged in', { userId: user.id, email: user.email });

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/auth/google
 * Initiate Google OAuth flow
 */
authRouter.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

/**
 * GET /api/auth/google/callback
 * Google OAuth callback
 */
authRouter.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    const token = generateToken(user);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  }
);

/**
 * GET /api/auth/microsoft
 * Initiate Microsoft OAuth flow
 */
authRouter.get(
  '/microsoft',
  passport.authenticate('microsoft', { session: false })
);

/**
 * GET /api/auth/microsoft/callback
 * Microsoft OAuth callback
 */
authRouter.get(
  '/microsoft/callback',
  passport.authenticate('microsoft', { session: false, failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    const token = generateToken(user);

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  }
);

/**
 * POST /api/auth/verify
 * Verify JWT token
 */
authRouter.post('/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'No token provided',
        },
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      success: true,
      data: { valid: true, user: decoded },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
authRouter.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'No token provided',
        },
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const newToken = generateToken(decoded);

    res.json({
      success: true,
      data: { token: newToken },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logout (invalidate token on client side)
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  // In production, add token to blacklist in Redis
  logger.info('User logged out');

  res.json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
});

export default authRouter;
