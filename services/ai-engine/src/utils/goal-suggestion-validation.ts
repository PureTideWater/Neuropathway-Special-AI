/**
 * Goal Suggestion Validation Utilities
 * Ensures all AI-generated goals meet federal IDEA compliance standards
 *
 * CRITICAL: Generated goals MUST be measurable per 34 CFR §300.320(a)(2)
 * This validation layer prevents non-compliant goals from being suggested
 *
 * Legal Foundation:
 * - 34 CFR §300.320(a)(2): "A statement of measurable annual goals"
 * - OSEP guidance: Goals must include observable behavior + measurable criteria
 */

import { logger } from './logger';

/**
 * Observable behavior verbs that can be objectively measured
 * Based on Bloom's Taxonomy and special education best practices
 */
const OBSERVABLE_VERBS = [
  // Knowledge/Comprehension
  'identify',
  'name',
  'list',
  'define',
  'describe',
  'recall',
  'recognize',
  'select',
  'state',

  // Application/Analysis
  'demonstrate',
  'solve',
  'complete',
  'apply',
  'calculate',
  'compute',
  'use',
  'write',
  'read',
  'answer',

  // Synthesis/Evaluation
  'create',
  'compose',
  'design',
  'construct',
  'produce',
  'explain',
  'compare',
  'contrast',
  'evaluate',

  // Functional Skills
  'participate',
  'initiate',
  'maintain',
  'follow',
  'request',
  'communicate',
  'interact',
  'organize',
];

/**
 * Non-observable verbs that should never be used in measurable goals
 * These are subjective and cannot be objectively measured
 */
const NON_OBSERVABLE_VERBS = [
  'know',
  'understand',
  'appreciate',
  'believe',
  'think',
  'feel',
  'learn',
  'improve', // Too vague without specific criteria
  'increase', // Too vague without specific criteria
  'develop', // Too vague without specific criteria
];

/**
 * Validate that a goal description is measurable
 * Returns detailed analysis of goal quality
 */
export function validateGoalMeasurability(goalDescription: string): {
  isValid: boolean;
  issues: string[];
  details: {
    hasObservableBehavior: boolean;
    hasMeasurableCriteria: boolean;
    hasCondition: boolean;
    observableVerb?: string;
    criteriaType?: string;
    foundNonObservableVerbs: string[];
  };
} {
  const issues: string[] = [];
  const details: any = {
    hasObservableBehavior: false,
    hasMeasurableCriteria: false,
    hasCondition: false,
    foundNonObservableVerbs: [],
  };

  const goalLower = goalDescription.toLowerCase();

  // Check 1: Observable behavior verb
  let foundObservableVerb = false;
  for (const verb of OBSERVABLE_VERBS) {
    if (goalLower.includes(verb)) {
      foundObservableVerb = true;
      details.hasObservableBehavior = true;
      details.observableVerb = verb;
      break;
    }
  }

  if (!foundObservableVerb) {
    issues.push('Goal lacks observable behavior verb (e.g., demonstrate, identify, write)');
  }

  // Check 2: Non-observable verbs (red flags)
  for (const verb of NON_OBSERVABLE_VERBS) {
    if (goalLower.includes(verb)) {
      details.foundNonObservableVerbs.push(verb);
      issues.push(`Goal uses non-observable verb "${verb}" which cannot be objectively measured`);
    }
  }

  // Check 3: Measurable criteria
  const hasPercentage = /\d+\s*%/.test(goalDescription);
  const hasRatio = /\d+\s+(?:out of|of)\s+\d+/.test(goalDescription);
  const hasAccuracy = /\d+\s*%\s*accuracy/i.test(goalDescription);
  const hasConsecutive = /\d+\s+consecutive/i.test(goalDescription);
  const hasTrials = /\d+\s+(?:out of|of)\s+\d+\s+trials/i.test(goalDescription);
  const hasNumericCriteria = /(?:at least|minimum|no more than|maximum)\s+\d+/.test(goalLower);

  if (hasPercentage || hasRatio || hasAccuracy || hasConsecutive || hasTrials || hasNumericCriteria) {
    details.hasMeasurableCriteria = true;

    if (hasPercentage) details.criteriaType = 'percentage';
    else if (hasRatio || hasTrials) details.criteriaType = 'ratio';
    else if (hasConsecutive) details.criteriaType = 'consecutive';
    else if (hasNumericCriteria) details.criteriaType = 'numeric';
  } else {
    issues.push(
      'Goal lacks measurable criteria (e.g., "80% accuracy", "4 out of 5 trials", "3 consecutive sessions")'
    );
  }

  // Check 4: Condition/Context (optional but recommended)
  const hasCondition =
    /given|when|with|during|in/i.test(goalDescription) ||
    /grade.level|classroom|independent|with support/i.test(goalDescription);

  if (hasCondition) {
    details.hasCondition = true;
  }

  // Overall validation
  const isValid = details.hasObservableBehavior && details.hasMeasurableCriteria && details.foundNonObservableVerbs.length === 0;

  return { isValid, issues, details };
}

/**
 * Validate goal is appropriate for student's grade level
 * Prevents suggesting goals that are too advanced or too basic
 */
export function validateGradeLevelAppropriateness(
  goalDescription: string,
  studentGrade: number,
  skillArea: string
): {
  isValid: boolean;
  issues: string[];
  details: {
    gradeLevel: number;
    skillArea: string;
    appropriateComplexity: boolean;
  };
} {
  const issues: string[] = [];
  const details = {
    gradeLevel: studentGrade,
    skillArea,
    appropriateComplexity: true,
  };

  // Validate grade level is realistic
  if (studentGrade < 0 || studentGrade > 12) {
    issues.push(`Invalid grade level: ${studentGrade}. Must be 0-12 (0 = PreK)`);
    details.appropriateComplexity = false;
  }

  // Check for grade-level indicators in goal
  const goalLower = goalDescription.toLowerCase();

  // Red flags for complexity mismatch
  if (studentGrade <= 2) {
    // Elementary (K-2)
    if (
      /college|university|career|employment|abstract|analyze|synthesize/i.test(goalDescription)
    ) {
      issues.push('Goal complexity appears too advanced for elementary student');
      details.appropriateComplexity = false;
    }
  } else if (studentGrade <= 5) {
    // Upper Elementary (3-5)
    if (/college|university|career|employment/i.test(goalDescription)) {
      issues.push('Goal includes content more appropriate for secondary students');
      details.appropriateComplexity = false;
    }
  } else if (studentGrade >= 9) {
    // High School (9-12)
    if (/single digit|basic shapes|primary colors/i.test(goalDescription)) {
      issues.push('Goal appears too basic for high school student');
      details.appropriateComplexity = false;
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    details,
  };
}

/**
 * Validate goal is appropriate for disability category
 * Ensures goals align with disability-specific needs
 */
export function validateDisabilityAlignment(
  goalDescription: string,
  disabilityCategory: string,
  goalType: 'academic' | 'functional'
): {
  isValid: boolean;
  warnings: string[];
  details: {
    disability: string;
    goalType: string;
    hasRelevantKeywords: boolean;
  };
} {
  const warnings: string[] = [];
  const goalLower = goalDescription.toLowerCase();
  const details = {
    disability: disabilityCategory,
    goalType,
    hasRelevantKeywords: false,
  };

  // Disability-specific keyword checks (warnings, not errors)
  switch (disabilityCategory.toLowerCase()) {
    case 'specific learning disability':
    case 'sld':
      if (goalType === 'academic') {
        const hasReading = /read|phonics|decoding|comprehension|fluency/.test(goalLower);
        const hasMath = /math|calculate|solve|number|equation/.test(goalLower);
        const hasWriting = /write|compose|spell|grammar/.test(goalLower);

        if (hasReading || hasMath || hasWriting) {
          details.hasRelevantKeywords = true;
        } else {
          warnings.push('Goal for SLD student should target reading, math, or writing skills');
        }
      }
      break;

    case 'speech or language impairment':
    case 'speech/language':
      const hasSpeech = /speak|articulate|pronounce|verbal|communication|language/.test(goalLower);
      if (hasSpeech) {
        details.hasRelevantKeywords = true;
      } else {
        warnings.push('Goal for speech/language impairment should target communication skills');
      }
      break;

    case 'autism spectrum disorder':
    case 'autism':
    case 'asd':
      if (goalType === 'functional') {
        const hasSocial = /social|interact|peer|communicate|conversation/.test(goalLower);
        if (hasSocial) {
          details.hasRelevantKeywords = true;
        } else {
          warnings.push('Functional goal for ASD student should consider social/communication needs');
        }
      }
      break;

    case 'emotional disturbance':
    case 'ed':
      if (goalType === 'functional') {
        const hasBehavior = /behavior|self-regulat|coping|emotion|social/.test(goalLower);
        if (hasBehavior) {
          details.hasRelevantKeywords = true;
        } else {
          warnings.push('Functional goal for ED student should target behavioral/emotional regulation');
        }
      }
      break;

    case 'intellectual disability':
    case 'id':
      const hasFunctional = /functional|daily living|independent|self-care/.test(goalLower);
      if (hasFunctional) {
        details.hasRelevantKeywords = true;
      } else {
        warnings.push('Goal for ID student should consider functional/adaptive skills');
      }
      break;

    default:
      // Unknown disability category - no specific warnings
      details.hasRelevantKeywords = true;
  }

  return {
    isValid: true, // Warnings don't make goal invalid
    warnings,
    details,
  };
}

/**
 * Validate a complete goal suggestion
 * Combines all validation checks
 */
export function validateGoalSuggestion(goal: {
  description: string;
  type: 'academic' | 'functional';
  studentGrade: number;
  disabilityCategory: string;
  skillArea: string;
}): {
  isValid: boolean;
  criticalIssues: string[];
  warnings: string[];
  score: number; // 0-100
  details: any;
} {
  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Validate input
  if (!goal.description || goal.description.trim().length < 20) {
    criticalIssues.push('Goal description is too short (minimum 20 characters)');
    score -= 50;
  }

  // Validate measurability (CRITICAL - federal requirement)
  const measurabilityCheck = validateGoalMeasurability(goal.description);
  if (!measurabilityCheck.isValid) {
    criticalIssues.push(...measurabilityCheck.issues);
    score -= 30; // Major deduction for non-measurable goals
  }

  // Validate grade-level appropriateness
  const gradeCheck = validateGradeLevelAppropriateness(
    goal.description,
    goal.studentGrade,
    goal.skillArea
  );
  if (!gradeCheck.isValid) {
    warnings.push(...gradeCheck.issues);
    score -= 10;
  }

  // Validate disability alignment (warnings only)
  const disabilityCheck = validateDisabilityAlignment(
    goal.description,
    goal.disabilityCategory,
    goal.type
  );
  if (disabilityCheck.warnings.length > 0) {
    warnings.push(...disabilityCheck.warnings);
    score -= 5 * disabilityCheck.warnings.length;
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  return {
    isValid: criticalIssues.length === 0,
    criticalIssues,
    warnings,
    score,
    details: {
      measurability: measurabilityCheck.details,
      gradeLevel: gradeCheck.details,
      disabilityAlignment: disabilityCheck.details,
    },
  };
}

/**
 * Validate a batch of goal suggestions
 * Ensures diversity and coverage of skill areas
 */
export function validateGoalSuggestionBatch(goals: any[]): {
  isValid: boolean;
  issues: string[];
  details: {
    totalGoals: number;
    validGoals: number;
    invalidGoals: number;
    academicGoals: number;
    functionalGoals: number;
    avgScore: number;
  };
} {
  const issues: string[] = [];
  let validCount = 0;
  let totalScore = 0;
  let academicCount = 0;
  let functionalCount = 0;

  if (!goals || goals.length === 0) {
    issues.push('No goals provided');
    return {
      isValid: false,
      issues,
      details: {
        totalGoals: 0,
        validGoals: 0,
        invalidGoals: 0,
        academicGoals: 0,
        functionalGoals: 0,
        avgScore: 0,
      },
    };
  }

  // Validate each goal
  for (const goal of goals) {
    const validation = validateGoalSuggestion(goal);
    if (validation.isValid) {
      validCount++;
    }
    totalScore += validation.score;

    if (goal.type === 'academic') academicCount++;
    else if (goal.type === 'functional') functionalCount++;
  }

  const avgScore = totalScore / goals.length;
  const invalidCount = goals.length - validCount;

  // Check for balance between academic and functional goals
  if (academicCount === 0) {
    issues.push('No academic goals suggested - IDEA requires academic goals');
  }
  if (functionalCount === 0) {
    issues.push('No functional goals suggested - IDEA requires functional goals when appropriate');
  }

  // At least 50% of goals should be valid
  if (validCount / goals.length < 0.5) {
    issues.push(`Only ${validCount} of ${goals.length} goals are compliant (need at least 50%)`);
  }

  return {
    isValid: issues.length === 0 && validCount === goals.length,
    issues,
    details: {
      totalGoals: goals.length,
      validGoals: validCount,
      invalidGoals: invalidCount,
      academicGoals: academicCount,
      functionalGoals: functionalCount,
      avgScore,
    },
  };
}

/**
 * Log goal validation for audit trail
 */
export function logGoalValidation(
  studentId: string,
  goalDescription: string,
  validationResult: any
): void {
  logger.info('Goal suggestion validated', {
    studentId,
    goal: goalDescription.substring(0, 100),
    isValid: validationResult.isValid,
    score: validationResult.score,
    criticalIssues: validationResult.criticalIssues?.length || 0,
    warnings: validationResult.warnings?.length || 0,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get remediation guidance for non-compliant goal
 */
export function getGoalRemediationGuidance(validationResult: any): string[] {
  const guidance: string[] = [];

  if (!validationResult.details.measurability.hasObservableBehavior) {
    guidance.push(
      'Add observable behavior verb: Replace vague verbs like "know" or "understand" with observable verbs like "demonstrate," "identify," "write," or "solve"'
    );
  }

  if (!validationResult.details.measurability.hasMeasurableCriteria) {
    guidance.push(
      'Add measurable criteria: Include percentage (e.g., "80% accuracy"), ratio (e.g., "4 out of 5 trials"), or numeric value (e.g., "3 consecutive sessions")'
    );
  }

  if (validationResult.details.measurability.foundNonObservableVerbs.length > 0) {
    guidance.push(
      `Remove non-observable verbs: "${validationResult.details.measurability.foundNonObservableVerbs.join(', ')}" cannot be objectively measured`
    );
  }

  if (!validationResult.details.measurability.hasCondition) {
    guidance.push(
      'Consider adding condition: Specify context like "Given a grade-level passage..." or "When presented with 20 math problems..."'
    );
  }

  return guidance;
}
