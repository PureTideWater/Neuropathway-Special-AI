/**
 * Translation Routes - Multilingual Parent Communication
 * COMPETITIVE ADVANTAGE: Communicate with parents in their native language
 * MARKET EXPANSION: Serve non-English speaking families (40% of US districts)
 * ACCESSIBILITY: Legal requirement in many states (Title VI compliance)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import {
  translateText,
  translateDocument,
  getSupportedLanguages,
  detectLanguage,
} from '../services/translation.service';
import { logger } from '../utils/logger';

export const translationRouter = Router();

/**
 * POST /api/translation/translate
 * Translate text to target language
 */
translationRouter.post(
  '/translate',
  [
    body('text').isString().notEmpty().withMessage('Text required'),
    body('targetLanguage').isString().notEmpty().withMessage('Target language required'),
    body('sourceLanguage').optional().isString(),
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

      const { text, targetLanguage, sourceLanguage } = req.body;

      logger.info('Translating text', {
        textLength: text.length,
        targetLanguage,
        sourceLanguage: sourceLanguage || 'auto',
      });

      const translation = await translateText(text, targetLanguage, sourceLanguage);

      logger.info('Translation completed', {
        targetLanguage,
        translatedLength: translation.translatedText.length,
      });

      res.json({
        success: true,
        data: translation,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/translation/translate-document
 * Translate entire IEP document (progress report, meeting notice, etc.)
 */
translationRouter.post(
  '/translate-document',
  [
    body('document').isObject().withMessage('Document object required'),
    body('targetLanguage').isString().notEmpty().withMessage('Target language required'),
    body('documentType').isString().notEmpty().withMessage('Document type required'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { document, targetLanguage, documentType } = req.body;

      logger.info('Translating document', {
        documentType,
        targetLanguage,
        fieldsCount: Object.keys(document).length,
      });

      const translatedDocument = await translateDocument(document, targetLanguage, documentType);

      logger.info('Document translation completed', {
        documentType,
        targetLanguage,
      });

      res.json({
        success: true,
        data: {
          translatedDocument,
          targetLanguage,
          originalLanguage: 'en',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/translation/supported-languages
 * Get list of supported languages
 */
translationRouter.get('/supported-languages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const languages = await getSupportedLanguages();

    res.json({
      success: true,
      data: {
        languages,
        count: languages.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/translation/detect-language
 * Detect language of given text
 */
translationRouter.post(
  '/detect-language',
  [body('text').isString().notEmpty().withMessage('Text required')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { text } = req.body;

      logger.info('Detecting language', { textLength: text.length });

      const detection = await detectLanguage(text);

      res.json({
        success: true,
        data: detection,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/translation/batch-translate
 * Translate multiple texts at once (for bulk operations)
 */
translationRouter.post(
  '/batch-translate',
  [
    body('texts').isArray().withMessage('Texts array required'),
    body('targetLanguage').isString().notEmpty().withMessage('Target language required'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { texts, targetLanguage } = req.body;

      logger.info('Batch translating texts', {
        count: texts.length,
        targetLanguage,
      });

      const translations = await Promise.all(
        texts.map((text: string) => translateText(text, targetLanguage))
      );

      res.json({
        success: true,
        data: {
          translations: translations.map((t) => t.translatedText),
          targetLanguage,
          count: translations.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default translationRouter;
