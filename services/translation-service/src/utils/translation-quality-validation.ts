/**
 * Translation Quality Validation Utilities
 * Ensures translated IEP documents maintain legal accuracy and meaning
 *
 * CRITICAL: IEP documents are legal documents
 * - Mistranslation can lead to compliance violations
 * - Parents must understand their rights (Title VI)
 * - Technical educational terms must be accurate
 *
 * Legal Foundation:
 * - Title VI of Civil Rights Act: LEP parents must have meaningful access
 * - IDEA §300.322(e): Notice in native language
 * - Office of Civil Rights Dear Colleague Letter (2015)
 */

import { logger } from './logger';

/**
 * Document types with different quality requirements
 */
export enum DocumentType {
  IEP_LEGAL = 'iep_legal', // Highest accuracy required
  PROGRESS_REPORT = 'progress_report', // High accuracy
  PARENT_COMMUNICATION = 'parent_communication', // Medium accuracy, tone important
  MEETING_INVITE = 'meeting_invite', // Medium accuracy
  GENERAL_INFO = 'general_info', // Lower accuracy acceptable
}

/**
 * Languages with known high-quality translation support
 */
export const HIGH_QUALITY_LANGUAGES = [
  'es', // Spanish
  'zh', // Chinese
  'vi', // Vietnamese
  'ar', // Arabic
  'ko', // Korean
  'tl', // Tagalog
  'fr', // French
  'de', // German
  'pt', // Portuguese
  'ru', // Russian
];

/**
 * Educational/legal terms that require special handling
 */
export const CRITICAL_IEP_TERMS = [
  'individualized education program',
  'least restrictive environment',
  'free appropriate public education',
  'specific learning disability',
  'autism spectrum disorder',
  'prior written notice',
  'procedural safeguards',
  'manifestation determination',
  'functional behavioral assessment',
  'transition services',
  'extended school year',
  'related services',
  'supplementary aids and services',
];

/**
 * Validate translation quality score from translation API
 */
export function validateTranslationQuality(
  quality: number | undefined,
  documentType: DocumentType,
  targetLanguage: string
): {
  isAcceptable: boolean;
  issues: string[];
  requiresHumanReview: boolean;
  details: {
    quality: number;
    threshold: number;
    documentType: DocumentType;
    highQualityLanguage: boolean;
  };
} {
  const issues: string[] = [];
  let requiresHumanReview = false;

  // Default quality if not provided
  const qualityScore = quality ?? 0;

  // Determine quality threshold based on document type
  let threshold = 0.8; // Default 80%
  switch (documentType) {
    case DocumentType.IEP_LEGAL:
      threshold = 0.95; // IEP documents require 95%+ quality
      requiresHumanReview = true; // Always require human review for legal docs
      break;
    case DocumentType.PROGRESS_REPORT:
      threshold = 0.90; // Progress reports 90%+
      break;
    case DocumentType.PARENT_COMMUNICATION:
      threshold = 0.85; // Communications 85%+
      break;
    case DocumentType.MEETING_INVITE:
      threshold = 0.80; // Invites 80%+
      break;
    case DocumentType.GENERAL_INFO:
      threshold = 0.75; // General info 75%+
      break;
  }

  // Check if language has high-quality support
  const isHighQualityLanguage = HIGH_QUALITY_LANGUAGES.includes(targetLanguage.toLowerCase());
  if (!isHighQualityLanguage) {
    issues.push(`Language "${targetLanguage}" may have lower translation quality - human review recommended`);
    requiresHumanReview = true;
  }

  // Check quality threshold
  if (qualityScore < threshold) {
    issues.push(
      `Translation quality ${(qualityScore * 100).toFixed(1)}% is below threshold ${(threshold * 100).toFixed(1)}%`
    );
    requiresHumanReview = true;
  }

  // Special case: IEP legal documents always need human review
  if (documentType === DocumentType.IEP_LEGAL) {
    issues.push('IEP documents require certified human review before delivery to parents');
  }

  const isAcceptable = qualityScore >= threshold;

  return {
    isAcceptable,
    issues,
    requiresHumanReview,
    details: {
      quality: qualityScore,
      threshold,
      documentType,
      highQualityLanguage: isHighQualityLanguage,
    },
  };
}

/**
 * Validate critical IEP terms were translated correctly
 * Checks if key legal/educational terms are present in translation
 */
export function validateCriticalTerms(
  sourceText: string,
  translatedText: string,
  knownTermTranslations?: Map<string, string>
): {
  isValid: boolean;
  warnings: string[];
  termsFound: number;
  termsMissing: string[];
} {
  const warnings: string[] = [];
  const termsMissing: string[] = [];
  let termsFound = 0;

  const sourceLower = sourceText.toLowerCase();

  for (const term of CRITICAL_IEP_TERMS) {
    if (sourceLower.includes(term)) {
      // Term exists in source
      termsFound++;

      // Check if known translation exists
      if (knownTermTranslations && knownTermTranslations.has(term)) {
        const expectedTranslation = knownTermTranslations.get(term)!;
        if (!translatedText.includes(expectedTranslation)) {
          warnings.push(`Critical term "${term}" may not be correctly translated - expected "${expectedTranslation}"`);
          termsMissing.push(term);
        }
      } else {
        // No known translation - just warn
        warnings.push(`Critical term "${term}" found - verify translation accuracy`);
      }
    }
  }

  return {
    isValid: termsMissing.length === 0,
    warnings,
    termsFound,
    termsMissing,
  };
}

/**
 * Validate translation maintains proper tone (formal vs informal)
 * IEP documents should use formal/respectful language
 */
export function validateTranslationTone(
  documentType: DocumentType,
  targetLanguage: string
): {
  expectedTone: 'formal' | 'neutral' | 'friendly';
  recommendations: string[];
} {
  const recommendations: string[] = [];
  let expectedTone: 'formal' | 'neutral' | 'friendly' = 'neutral';

  switch (documentType) {
    case DocumentType.IEP_LEGAL:
      expectedTone = 'formal';
      recommendations.push('Use formal address (e.g., "usted" in Spanish, not "tú")');
      recommendations.push('Maintain professional, respectful language');
      break;

    case DocumentType.PROGRESS_REPORT:
      expectedTone = 'formal';
      recommendations.push('Use formal tone when discussing student performance');
      break;

    case DocumentType.PARENT_COMMUNICATION:
      expectedTone = 'friendly';
      recommendations.push('Warm, welcoming tone while maintaining professionalism');
      break;

    case DocumentType.MEETING_INVITE:
      expectedTone = 'neutral';
      recommendations.push('Professional but approachable tone');
      break;

    case DocumentType.GENERAL_INFO:
      expectedTone = 'neutral';
      break;
  }

  // Language-specific recommendations
  if (targetLanguage === 'es') {
    recommendations.push('Spanish: Use "usted" for formal, "tú" for friendly');
  } else if (targetLanguage === 'fr') {
    recommendations.push('French: Use "vous" for formal, "tu" for friendly');
  } else if (targetLanguage === 'de') {
    recommendations.push('German: Use "Sie" for formal, "du" for friendly');
  }

  return {
    expectedTone,
    recommendations,
  };
}

/**
 * Validate translation length is reasonable
 * Major length changes may indicate translation issues
 */
export function validateTranslationLength(
  sourceLength: number,
  translatedLength: number,
  targetLanguage: string
): {
  isReasonable: boolean;
  warnings: string[];
  details: {
    lengthRatio: number;
    expectedRangeMin: number;
    expectedRangeMax: number;
  };
} {
  const warnings: string[] = [];

  // Language expansion/contraction factors (approximate)
  const expansionFactors: Record<string, [number, number]> = {
    es: [0.9, 1.2], // Spanish: -10% to +20%
    fr: [0.95, 1.25], // French: -5% to +25%
    de: [0.95, 1.3], // German: -5% to +30%
    zh: [0.5, 0.8], // Chinese: -50% to -20% (more compact)
    ja: [0.6, 0.9], // Japanese: -40% to -10%
    ar: [0.9, 1.2], // Arabic: -10% to +20%
    default: [0.7, 1.5], // Default: -30% to +50%
  };

  const [minFactor, maxFactor] = expansionFactors[targetLanguage] || expansionFactors.default;
  const lengthRatio = translatedLength / sourceLength;

  const expectedRangeMin = minFactor;
  const expectedRangeMax = maxFactor;

  if (lengthRatio < minFactor) {
    warnings.push(
      `Translation is ${((1 - lengthRatio) * 100).toFixed(1)}% shorter than source - may be incomplete`
    );
  } else if (lengthRatio > maxFactor) {
    warnings.push(
      `Translation is ${((lengthRatio - 1) * 100).toFixed(1)}% longer than source - may have additions`
    );
  }

  const isReasonable = lengthRatio >= minFactor && lengthRatio <= maxFactor;

  return {
    isReasonable,
    warnings,
    details: {
      lengthRatio,
      expectedRangeMin: minFactor,
      expectedRangeMax: maxFactor,
    },
  };
}

/**
 * Complete translation validation
 */
export function validateTranslation(input: {
  sourceText: string;
  translatedText: string;
  targetLanguage: string;
  documentType: DocumentType;
  qualityScore?: number;
  knownTermTranslations?: Map<string, string>;
}): {
  isValid: boolean;
  requiresHumanReview: boolean;
  criticalIssues: string[];
  warnings: string[];
  score: number;
  details: any;
} {
  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // 1. Validate quality score
  const qualityCheck = validateTranslationQuality(
    input.qualityScore,
    input.documentType,
    input.targetLanguage
  );
  if (!qualityCheck.isAcceptable) {
    criticalIssues.push(...qualityCheck.issues);
    score -= 30;
  }

  // 2. Validate critical terms
  const termsCheck = validateCriticalTerms(
    input.sourceText,
    input.translatedText,
    input.knownTermTranslations
  );
  if (!termsCheck.isValid) {
    warnings.push(...termsCheck.warnings);
    score -= 20;
  }

  // 3. Validate length
  const lengthCheck = validateTranslationLength(
    input.sourceText.length,
    input.translatedText.length,
    input.targetLanguage
  );
  if (!lengthCheck.isReasonable) {
    warnings.push(...lengthCheck.warnings);
    score -= 10;
  }

  // 4. Validate tone
  const toneCheck = validateTranslationTone(input.documentType, input.targetLanguage);
  warnings.push(...toneCheck.recommendations);

  // 5. Check for empty translation
  if (!input.translatedText || input.translatedText.trim().length === 0) {
    criticalIssues.push('Translation is empty - translation failed');
    score = 0;
  }

  const isValid = criticalIssues.length === 0 && score >= 70;

  return {
    isValid,
    requiresHumanReview: qualityCheck.requiresHumanReview,
    criticalIssues,
    warnings,
    score: Math.max(0, score),
    details: {
      quality: qualityCheck.details,
      terms: termsCheck,
      length: lengthCheck.details,
      tone: toneCheck,
    },
  };
}

/**
 * Log translation for audit trail
 */
export function logTranslation(
  documentId: string,
  sourceLanguage: string,
  targetLanguage: string,
  documentType: DocumentType,
  validationResult: any
): void {
  logger.info('Translation validated', {
    documentId,
    sourceLanguage,
    targetLanguage,
    documentType,
    isValid: validationResult.isValid,
    requiresHumanReview: validationResult.requiresHumanReview,
    score: validationResult.score,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Generate human review checklist
 */
export function generateHumanReviewChecklist(
  documentType: DocumentType,
  targetLanguage: string
): string[] {
  const checklist: string[] = [];

  // Common checks for all documents
  checklist.push('✓ Translation accurately conveys the meaning of the source document');
  checklist.push('✓ No information has been added or omitted');
  checklist.push('✓ Numbers, dates, and names are correctly transcribed');

  // Document-specific checks
  if (documentType === DocumentType.IEP_LEGAL) {
    checklist.push('✓ All legal and educational terms are correctly translated');
    checklist.push('✓ Parent rights and procedural safeguards are clearly explained');
    checklist.push('✓ Formal tone is maintained throughout');
    checklist.push('✓ Translation complies with Title VI requirements');
    checklist.push('✓ Certified translator has signed off');
  }

  if (documentType === DocumentType.PROGRESS_REPORT) {
    checklist.push('✓ Progress data and percentages are accurate');
    checklist.push('✓ Goal descriptions are understandable to parents');
  }

  if (documentType === DocumentType.PARENT_COMMUNICATION) {
    checklist.push('✓ Tone is warm and welcoming');
    checklist.push('✓ Action items are clear');
  }

  // Language-specific checks
  checklist.push(`✓ Cultural nuances for ${targetLanguage} speakers are respected`);
  checklist.push(`✓ Formal address is used appropriately for ${targetLanguage}`);

  return checklist;
}
