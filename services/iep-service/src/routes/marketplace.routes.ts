/**
 * IEP Template Marketplace Routes
 * Buy/sell IEP templates, goal banks, accommodation libraries
 *
 * COMPETITIVE ADVANTAGE: Two-sided marketplace with network effects
 * BUSINESS VALUE: Transaction fees (15-30% like App Store)
 * MONETIZATION: Premium templates, verified expert content
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { logger } from '../utils/logger';

export const marketplaceRouter = Router();

/**
 * GET /api/marketplace/templates
 * Browse IEP templates in marketplace
 */
marketplaceRouter.get(
  '/templates',
  [
    query('category').optional().isIn(['goals', 'accommodations', 'services', 'full-iep']),
    query('disability').optional().isString(),
    query('gradeLevel').optional().isString(),
    query('priceRange').optional().isString(),
    query('sort').optional().isIn(['popular', 'recent', 'price-low', 'price-high', 'rating']),
    query('verified').optional().isBoolean(),
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

      const templates = [
        {
          id: 'template-1',
          title: 'Reading Comprehension Goals - Dyslexia (K-5)',
          description: '12 research-based reading goals aligned with Orton-Gillingham',
          category: 'goals',
          disability: 'Dyslexia',
          gradeLevel: 'K-5',
          price: 9.99,
          currency: 'USD',
          authorId: 'author-1',
          authorName: 'Dr. Sarah Martinez',
          authorVerified: true,
          rating: 4.8,
          reviewCount: 127,
          purchaseCount: 1543,
          tags: ['reading', 'dyslexia', 'evidence-based', 'K-5'],
          preview: 'By [date], student will decode CVC words with 90% accuracy...',
          createdAt: '2024-10-15',
        },
        {
          id: 'template-2',
          title: 'Math IEP Goals Bundle - Dyscalculia',
          description: '25 measurable math goals for students with dyscalculia (grades 3-8)',
          category: 'goals',
          disability: 'Dyscalculia',
          gradeLevel: '3-8',
          price: 14.99,
          currency: 'USD',
          authorId: 'author-2',
          authorName: 'Jennifer Lee, M.Ed.',
          authorVerified: true,
          rating: 4.9,
          reviewCount: 89,
          purchaseCount: 892,
          tags: ['math', 'dyscalculia', 'middle-school'],
          preview: 'Student will solve two-step word problems using visual models...',
          createdAt: '2024-09-20',
        },
      ];

      return res.json({ success: true, data: { templates, count: templates.length } });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /api/marketplace/templates/:templateId
 * Get detailed template information
 */
marketplaceRouter.get(
  '/templates/:templateId',
  [param('templateId').isString().notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: errors.array() },
        });
      }

      const template = {
        id: req.params.templateId,
        title: 'Reading Comprehension Goals - Dyslexia (K-5)',
        fullContent: '... full template content ...',
        price: 9.99,
        authorId: 'author-1',
        authorName: 'Dr. Sarah Martinez',
        authorBio: 'Special education consultant with 15 years experience...',
        reviews: [
          { rating: 5, comment: 'Excellent goals! Saved me hours.', author: 'Teacher123' },
        ],
      };

      return res.json({ success: true, data: template });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * POST /api/marketplace/purchase
 * Purchase a template
 */
marketplaceRouter.post(
  '/purchase',
  [
    body('templateId').isString().notEmpty(),
    body('userId').isUUID(),
    body('paymentMethodId').isString(),
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

      const { templateId, userId } = req.body;

      // In production: Process payment with Stripe
      const purchase = {
        id: `purchase-${Date.now()}`,
        templateId,
        userId,
        price: 9.99,
        currency: 'USD',
        platformFee: 2.00, // 20% platform fee
        authorEarnings: 7.99,
        purchasedAt: new Date(),
        status: 'completed',
      };

      logger.info('Template purchased', { templateId, userId, price: purchase.price });

      return res.status(201).json({ success: true, data: purchase });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * POST /api/marketplace/templates
 * Create new template for sale (seller creates listing)
 */
marketplaceRouter.post(
  '/templates',
  [
    body('title').isString().isLength({ min: 10, max: 200 }),
    body('description').isString().isLength({ min: 50, max: 1000 }),
    body('category').isIn(['goals', 'accommodations', 'services', 'full-iep']),
    body('content').isString().notEmpty(),
    body('price').isFloat({ min: 0, max: 999.99 }),
    body('authorId').isUUID(),
    body('tags').isArray(),
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

      const { title, description, category, content, price, authorId, tags } = req.body;

      const template = {
        id: `template-${Date.now()}`,
        title,
        description,
        category,
        content,
        price,
        authorId,
        tags,
        status: 'pending-review', // Must be approved before going live
        createdAt: new Date(),
      };

      logger.info('Template submitted for review', { templateId: template.id, authorId });

      return res.status(201).json({ success: true, data: template });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /api/marketplace/my-purchases/:userId
 * Get user's purchased templates
 */
marketplaceRouter.get(
  '/my-purchases/:userId',
  [param('userId').isUUID()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: errors.array() },
        });
      }

      const purchases = [
        {
          id: 'purchase-1',
          templateId: 'template-1',
          templateTitle: 'Reading Comprehension Goals - Dyslexia (K-5)',
          price: 9.99,
          purchasedAt: '2024-11-01',
        },
      ];

      return res.json({ success: true, data: { purchases, count: purchases.length } });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /api/marketplace/stats/seller/:authorId
 * Get seller earnings and stats
 */
marketplaceRouter.get(
  '/stats/seller/:authorId',
  [param('authorId').isUUID()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: errors.array() },
        });
      }

      const stats = {
        authorId: req.params.authorId,
        totalEarnings: 1247.89,
        totalSales: 156,
        activeTemplates: 8,
        averageRating: 4.7,
        totalReviews: 234,
        last30DaysEarnings: 312.45,
        last30DaysSales: 39,
      };

      return res.json({ success: true, data: stats });
    } catch (error) {
      return next(error);
    }
  }
);

export default marketplaceRouter;
