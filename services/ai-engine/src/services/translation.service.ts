/**
 * Translation Service - Multilingual Parent Communication
 * Auto-translate IEP documents, progress reports, and communications
 *
 * COMPETITIVE ADVANTAGE:
 * - Serve non-English speaking families (40% of US students)
 * - Legal compliance (Title VI of Civil Rights Act)
 * - Market expansion to multilingual districts
 *
 * BUSINESS VALUE:
 * - Expand addressable market by 3x
 * - Meet federal accessibility requirements
 * - Differentiate from competitors (most have English-only)
 */

import { logger } from '../utils/logger';

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

export interface LanguageDetection {
  language: string;
  languageName: string;
  confidence: number;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl'; // Left-to-right or right-to-left
}

/**
 * Supported languages (10 most common in US schools)
 */
const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
  { code: 'zh', name: 'Chinese (Mandarin)', nativeName: '中文', direction: 'ltr' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr' },
];

/**
 * Translate text using AI (GPT-4 or DeepL API)
 * GPT-4 maintains educational context better than Google Translate
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<TranslationResult> {
  try {
    logger.info('Translating text', {
      textLength: text.length,
      sourceLanguage,
      targetLanguage,
    });

    // In production: Use GPT-4 or DeepL API
    // const translation = await openai.chat.completions.create({
    //   model: 'gpt-4o',
    //   messages: [
    //     {
    //       role: 'system',
    //       content: `You are a professional translator specializing in educational documents.
    //                 Translate the following text from ${sourceLanguage} to ${targetLanguage}.
    //                 Maintain educational terminology accuracy. Preserve formatting.`,
    //     },
    //     {
    //       role: 'user',
    //       content: text,
    //     },
    //   ],
    // });

    // Mock translation for demonstration
    const translatedText = await mockTranslate(text, targetLanguage);

    logger.info('Translation completed', {
      sourceLanguage,
      targetLanguage,
      originalLength: text.length,
      translatedLength: translatedText.length,
    });

    return {
      translatedText,
      sourceLanguage,
      targetLanguage,
      confidence: 0.95,
    };
  } catch (error) {
    logger.error('Translation failed', error as Error, {
      sourceLanguage,
      targetLanguage,
    });
    throw new Error('Failed to translate text');
  }
}

/**
 * Translate entire document (IEP, progress report, meeting notice)
 * Preserves structure and educational terminology
 */
export async function translateDocument(
  document: any,
  targetLanguage: string,
  documentType: string
): Promise<any> {
  try {
    logger.info('Translating document', {
      documentType,
      targetLanguage,
      fieldsCount: Object.keys(document).length,
    });

    // Recursively translate all text fields in document
    const translatedDocument = await translateObjectRecursive(document, targetLanguage);

    logger.info('Document translation completed', {
      documentType,
      targetLanguage,
    });

    return translatedDocument;
  } catch (error) {
    logger.error('Document translation failed', error as Error, {
      documentType,
      targetLanguage,
    });
    throw new Error('Failed to translate document');
  }
}

/**
 * Recursively translate all string values in an object
 */
async function translateObjectRecursive(obj: any, targetLanguage: string): Promise<any> {
  if (typeof obj === 'string') {
    // Translate string
    const result = await translateText(obj, targetLanguage);
    return result.translatedText;
  } else if (Array.isArray(obj)) {
    // Translate array elements
    return await Promise.all(obj.map((item) => translateObjectRecursive(item, targetLanguage)));
  } else if (typeof obj === 'object' && obj !== null) {
    // Translate object properties
    const translatedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Don't translate certain fields (IDs, dates, numbers, etc.)
      if (shouldSkipTranslation(key)) {
        translatedObj[key] = value;
      } else {
        translatedObj[key] = await translateObjectRecursive(value, targetLanguage);
      }
    }
    return translatedObj;
  } else {
    // Return primitive values as-is
    return obj;
  }
}

/**
 * Determine if a field should be skipped during translation
 */
function shouldSkipTranslation(fieldName: string): boolean {
  const skipFields = [
    'id',
    'uuid',
    'date',
    'timestamp',
    'createdAt',
    'updatedAt',
    'email',
    'phone',
    'url',
    'score',
    'percentage',
    'count',
  ];

  return skipFields.some((skip) => fieldName.toLowerCase().includes(skip.toLowerCase()));
}

/**
 * Get list of supported languages
 */
export async function getSupportedLanguages(): Promise<SupportedLanguage[]> {
  return SUPPORTED_LANGUAGES;
}

/**
 * Detect language of text
 */
export async function detectLanguage(text: string): Promise<LanguageDetection> {
  try {
    logger.info('Detecting language', { textLength: text.length });

    // In production: Use language detection API or GPT-4
    // For now, simple heuristic based on character sets

    // Mock detection
    let detectedLanguage = 'en';
    let languageName = 'English';

    // Check for common non-English patterns
    if (/[\u4e00-\u9fa5]/.test(text)) {
      detectedLanguage = 'zh';
      languageName = 'Chinese (Mandarin)';
    } else if (/[\u0600-\u06ff]/.test(text)) {
      detectedLanguage = 'ar';
      languageName = 'Arabic';
    } else if (/[\u0400-\u04ff]/.test(text)) {
      detectedLanguage = 'ru';
      languageName = 'Russian';
    } else if (/[\uac00-\ud7af]/.test(text)) {
      detectedLanguage = 'ko';
      languageName = 'Korean';
    } else if (/[áéíóúñ¿¡]/i.test(text)) {
      detectedLanguage = 'es';
      languageName = 'Spanish';
    }

    logger.info('Language detected', {
      detectedLanguage,
      languageName,
    });

    return {
      language: detectedLanguage,
      languageName,
      confidence: 0.92,
    };
  } catch (error) {
    logger.error('Language detection failed', error as Error);
    throw new Error('Failed to detect language');
  }
}

/**
 * Mock translation function
 * In production: Replace with real translation API
 */
async function mockTranslate(text: string, targetLanguage: string): Promise<string> {
  // Mock translations for common phrases
  const mockTranslations: { [key: string]: { [lang: string]: string } } = {
    'IEP Progress Report': {
      es: 'Informe de Progreso del IEP',
      zh: 'IEP进度报告',
      vi: 'Báo Cáo Tiến Độ IEP',
      ar: 'تقرير تقدم خطة التعليم الفردية',
      fr: 'Rapport de Progrès du PEI',
    },
    'Your child is making good progress on their IEP goals.': {
      es: 'Su hijo está progresando bien en sus metas del IEP.',
      zh: '您的孩子在IEP目标方面取得了良好进展。',
      vi: 'Con bạn đang tiến bộ tốt trong các mục tiêu IEP.',
      ar: 'طفلك يحرز تقدمًا جيدًا في أهداف خطة التعليم الفردية.',
      fr: 'Votre enfant fait de bons progrès dans ses objectifs du PEI.',
    },
    'Meeting scheduled for': {
      es: 'Reunión programada para',
      zh: '会议安排在',
      vi: 'Cuộc họp được lên lịch vào',
      ar: 'الاجتماع المقرر في',
      fr: 'Réunion programmée pour',
    },
    'Reading Comprehension': {
      es: 'Comprensión de Lectura',
      zh: '阅读理解',
      vi: 'Đọc Hiểu',
      ar: 'فهم القراءة',
      fr: 'Compréhension de Lecture',
    },
  };

  // Return mock translation if available
  if (mockTranslations[text] && mockTranslations[text][targetLanguage]) {
    return mockTranslations[text][targetLanguage];
  }

  // Otherwise, return original with language prefix (for demo)
  const langPrefix = targetLanguage.toUpperCase();
  return `[${langPrefix}] ${text}`;
}

/**
 * Get language direction (LTR or RTL)
 * Important for proper text rendering
 */
export function getLanguageDirection(languageCode: string): 'ltr' | 'rtl' {
  const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === languageCode);
  return language?.direction || 'ltr';
}

/**
 * Get language native name
 */
export function getLanguageName(languageCode: string, native: boolean = false): string {
  const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === languageCode);
  if (!language) return languageCode;
  return native ? language.nativeName : language.name;
}
