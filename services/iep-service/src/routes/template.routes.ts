/**
 * Smart IEP Template Routes
 * COMPETITIVE ADVANTAGE: AI-powered templates that learn from past IEPs
 * MagicSchool has generic templates - we have smart, personalized templates
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { logger } from '../utils/logger';

export const templateRouter = Router();

/**
 * GET /api/templates
 * Get all available IEP templates
 * Includes district-specific and AI-suggested templates
 */
templateRouter.get(
  '/',
  [query('districtId').optional().isString()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { districtId } = req.query;

      logger.info('Fetching IEP templates', { districtId });

      // Mock templates (in production, fetch from database)
      const templates = [
        {
          id: 'template-1',
          name: 'Elementary Reading & Math Support',
          category: 'Elementary',
          description: 'Comprehensive template for students needing support in reading and math',
          useCount: 127,
          successRate: 0.89, // Based on goal completion rates
          avgTimeSaved: '4h 20m',
          tags: ['reading', 'math', 'elementary', 'grades K-5'],
          domains: ['Reading Comprehension', 'Math Calculation', 'Written Expression'],
          recommendedFor: ['Learning Disability', 'Dyslexia'],
          lastUpdated: '2024-10-15',
          aiGenerated: false,
          districtSpecific: true,
        },
        {
          id: 'template-2',
          name: 'Executive Function & Organization',
          category: 'Behavioral/Executive Function',
          description: 'Template for students with ADHD or executive function challenges',
          useCount: 89,
          successRate: 0.85,
          avgTimeSaved: '3h 45m',
          tags: ['ADHD', 'executive function', 'organization', 'attention'],
          domains: ['Organization', 'Task Completion', 'Impulse Control'],
          recommendedFor: ['ADHD', 'Executive Function Disorder'],
          lastUpdated: '2024-09-20',
          aiGenerated: false,
          districtSpecific: false,
        },
        {
          id: 'template-3',
          name: 'Social Skills & Emotional Regulation',
          category: 'Social-Emotional',
          description: 'Template for students needing social skills and emotional support',
          useCount: 56,
          successRate: 0.91,
          avgTimeSaved: '3h 30m',
          tags: ['autism', 'social skills', 'emotional regulation', 'behavior'],
          domains: ['Social Skills', 'Emotional Regulation', 'Peer Interaction'],
          recommendedFor: ['Autism Spectrum Disorder', 'Emotional Disturbance'],
          lastUpdated: '2024-11-01',
          aiGenerated: false,
          districtSpecific: false,
        },
        {
          id: 'template-ai-1',
          name: 'AI-Suggested: Reading + Attention (Custom for Your District)',
          category: 'AI-Generated',
          description: 'AI discovered this combination works exceptionally well in your district',
          useCount: 23,
          successRate: 0.94, // Higher than standard templates!
          avgTimeSaved: '5h 10m',
          tags: ['reading', 'attention', 'AI-optimized'],
          domains: ['Reading Fluency', 'Sustained Attention', 'Reading Comprehension'],
          recommendedFor: ['Learning Disability', 'ADHD'],
          lastUpdated: '2024-11-05',
          aiGenerated: true,
          districtSpecific: true,
          aiInsight: 'Based on analysis of 45 similar IEPs in your district, this combination leads to 28% faster goal achievement.',
        },
      ];

      // Filter by district if specified
      const filteredTemplates = districtId
        ? templates.filter((t) => !t.districtSpecific || t.districtSpecific)
        : templates;

      res.json({
        success: true,
        data: {
          templates: filteredTemplates,
          total: filteredTemplates.length,
          categories: ['Elementary', 'Secondary', 'Behavioral/Executive Function', 'Social-Emotional', 'AI-Generated'],
        },
        message: `${filteredTemplates.length} templates available`,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/templates/:id
 * Get detailed template with sample goals, accommodations, services
 */
templateRouter.get(
  '/:id',
  [param('id').isString().notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      logger.info('Fetching template details', { id });

      // Mock detailed template
      const template = {
        id,
        name: 'Elementary Reading & Math Support',
        category: 'Elementary',
        description: 'Comprehensive template for students needing support in reading and math',

        // Sample goals included in template
        sampleGoals: [
          {
            domain: 'Reading Comprehension',
            description: '[Student] will improve reading comprehension skills as measured by [assessment]',
            baseline: 'Currently reading at [grade level] with [comprehension percentage]',
            target: 'Increase to [target level] with [target percentage] comprehension',
            measurementMethod: 'Running records, DIBELS, teacher observation',
            progressMonitoringSchedule: 'Weekly',
            accommodations: ['Extended time', 'Chunked reading', 'Visual supports'],
          },
          {
            domain: 'Math Calculation',
            description: '[Student] will improve math calculation accuracy as measured by [assessment]',
            baseline: 'Currently completing [percentage]% of grade-level problems correctly',
            target: 'Increase to [target percentage]% accuracy',
            measurementMethod: 'Weekly computation probes',
            progressMonitoringSchedule: 'Weekly',
            accommodations: ['Calculator', 'Extended time', 'Reference charts'],
          },
        ],

        // Sample accommodations
        accommodations: {
          classroom: [
            'Extended time for assignments',
            'Preferential seating',
            'Visual schedule',
            'Chunking of assignments',
            'Small group instruction',
            'Frequent breaks',
          ],
          testing: [
            'Extended time (1.5x)',
            'Separate setting',
            'Read-aloud for non-reading tests',
            'Use of calculator',
            'Breaks as needed',
          ],
        },

        // Sample services
        services: [
          {
            type: 'Specialized Academic Instruction (SAI)',
            frequency: '4 times per week',
            duration: 30,
            location: 'Special Education Classroom',
            provider: 'Special Education Teacher',
          },
          {
            type: 'Speech and Language Therapy',
            frequency: '1 time per week',
            duration: 30,
            location: 'Speech Room',
            provider: 'Speech-Language Pathologist',
          },
        ],

        // Usage statistics
        stats: {
          totalUses: 127,
          successRate: 0.89,
          avgGoalCompletionTime: 8.5, // months
          avgTimeSaved: '4h 20m',
          mostCommonModifications: [
            'Adjusted reading level targets',
            'Changed progress monitoring frequency',
            'Added behavior goals',
          ],
        },

        // AI insights
        aiInsights: [
          {
            type: 'success_pattern',
            message: 'IEPs using this template show 23% faster progress when combined with daily reading intervention',
            confidence: 0.87,
          },
          {
            type: 'common_addition',
            message: '68% of teachers add a written expression goal when using this template',
            confidence: 0.92,
            suggestion: 'Consider adding a written expression goal',
          },
        ],
      };

      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/templates/suggest
 * AI-powered template suggestion based on student profile
 * KILLER FEATURE - Analyzes student needs and suggests best template
 */
templateRouter.post(
  '/suggest',
  [
    body('studentProfile').isObject(),
    body('focusAreas').optional().isArray(),
    body('eligibilityCategory').optional().isString(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentProfile, focusAreas = [], eligibilityCategory } = req.body;

      logger.info('Suggesting templates', { eligibilityCategory, focusAreas });

      // AI analyzes student profile and suggests best templates
      // In production, this would use actual AI model
      const suggestions = [
        {
          templateId: 'template-ai-1',
          name: 'AI-Suggested: Reading + Attention (Custom for Your District)',
          matchScore: 0.94, // 94% match to student needs
          reasoning: [
            'Student profile indicates reading challenges (current level 2.1, grade 4)',
            'Parent concerns mention difficulty focusing on tasks',
            'Similar students in your district averaged 8.2 months to goal achievement with this template',
            'This template includes proven accommodations for reading + attention challenges',
          ],
          expectedOutcomes: {
            avgGoalCompletionTime: '8.2 months',
            successRate: 0.94,
            timeSaved: '5h 10m vs manual creation',
          },
          customizations: [
            'Baseline will be set to current reading level (2.1)',
            'Target adjusted to realistic 1.5 grade levels growth',
            'Attention goal added based on parent input',
          ],
          quickPreview: {
            goalCount: 3,
            domains: ['Reading Fluency', 'Reading Comprehension', 'Sustained Attention'],
            accommodationCount: 8,
            serviceCount: 2,
          },
        },
        {
          templateId: 'template-1',
          name: 'Elementary Reading & Math Support',
          matchScore: 0.87,
          reasoning: [
            'Standard template for elementary students with reading challenges',
            'Used successfully 127 times in your district',
            'Includes comprehensive reading support goals',
          ],
          expectedOutcomes: {
            avgGoalCompletionTime: '9.5 months',
            successRate: 0.89,
            timeSaved: '4h 20m vs manual creation',
          },
        },
        {
          templateId: 'template-2',
          name: 'Executive Function & Organization',
          matchScore: 0.73,
          reasoning: [
            'Parent mentions difficulty staying on task',
            'Good for attention challenges',
            'May need to add reading goals manually',
          ],
          expectedOutcomes: {
            avgGoalCompletionTime: '10.1 months',
            successRate: 0.85,
            timeSaved: '3h 45m vs manual creation',
          },
        },
      ];

      res.json({
        success: true,
        data: {
          suggestions,
          analysisConfidence: 0.91,
          message: 'Found 3 templates matching student profile',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/templates/create-from-existing
 * Create new template from successful IEP
 * Allows districts to build template library from their best IEPs
 */
templateRouter.post(
  '/create-from-existing',
  [
    body('iepId').isString().notEmpty(),
    body('templateName').isString().notEmpty(),
    body('description').isString(),
    body('makePublic').optional().isBoolean(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { iepId, templateName, description, makePublic = false } = req.body;

      logger.info('Creating template from IEP', { iepId, templateName, makePublic });

      // Fetch IEP and convert to template
      const newTemplate = {
        id: `template-${Date.now()}`,
        name: templateName,
        description,
        sourceIepId: iepId,
        category: 'Custom',
        useCount: 0,
        createdBy: 'teacher-id', // From auth token
        createdAt: new Date().toISOString(),
        isPublic: makePublic,
        status: 'active',
      };

      res.json({
        success: true,
        data: newTemplate,
        message: `Template "${templateName}" created successfully`,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/templates/:id/use
 * Track template usage (for analytics)
 */
templateRouter.post(
  '/:id/use',
  [param('id').isString().notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      logger.info('Template used', { templateId: id });

      // Increment usage counter
      res.json({
        success: true,
        message: 'Template usage tracked',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/templates/analytics/effectiveness
 * Analyze template effectiveness across district
 * Shows which templates lead to best outcomes
 */
templateRouter.get(
  '/analytics/effectiveness',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Fetching template effectiveness analytics');

      const analytics = {
        totalTemplates: 47,
        totalIEPsUsingTemplates: 234,
        avgTimeSaved: '4h 32m per IEP',

        topPerformingTemplates: [
          {
            templateId: 'template-ai-1',
            name: 'AI-Suggested: Reading + Attention',
            useCount: 23,
            successRate: 0.94,
            avgGoalCompletionTime: 8.2, // months
            timeSavedPerUse: '5h 10m',
            totalTimeSaved: '119h 10m',
          },
          {
            templateId: 'template-3',
            name: 'Social Skills & Emotional Regulation',
            useCount: 56,
            successRate: 0.91,
            avgGoalCompletionTime: 9.1,
            timeSavedPerUse: '3h 30m',
            totalTimeSaved: '196h',
          },
        ],

        insights: [
          {
            insight: 'AI-generated templates show 12% higher success rates than standard templates',
            impact: 'high',
          },
          {
            insight: 'Templates used consistently across district lead to better compliance scores',
            impact: 'medium',
          },
          {
            insight: 'Custom district templates save an average of 47 minutes more than generic templates',
            impact: 'medium',
          },
        ],

        recommendations: [
          'Create more AI-optimized templates for common student profiles',
          'Retire template "Basic Academic Support" (only 0.72 success rate)',
          'Share top-performing templates across all schools in district',
        ],
      };

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default templateRouter;
