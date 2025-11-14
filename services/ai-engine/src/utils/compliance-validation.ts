/**
 * Compliance Validation Utilities
 * Bulletproof validation logic for IEP compliance checking
 *
 * PURPOSE: Ensure compliance checks are defensible and legally sound
 * VALIDATION: All rules backed by actual federal/state regulations
 */

import { logger } from '../utils/logger';

/**
 * Validate IEP structure has all required sections
 * Returns array of missing sections
 */
export function validateIEPStructure(iep: any): string[] {
  const missingSections: string[] = [];

  const requiredSections = [
    'id',
    'studentId',
    'studentAge',
    'disabilityCategory',
    'presentLevels', // PLOP
    'goals',
    'services',
    'accommodations',
    'progressMeasurement',
    'lreJustification',
  ];

  for (const section of requiredSections) {
    if (!iep[section]) {
      missingSections.push(section);
    }
  }

  return missingSections;
}

/**
 * Validate PLOP (Present Levels of Performance) section
 * 34 CFR §300.320(a)(1) requirement
 */
export function validatePLOP(iep: any): {
  isValid: boolean;
  issues: string[];
  details: any;
} {
  const issues: string[] = [];

  // Check if PLOP exists
  if (!iep.presentLevels || typeof iep.presentLevels !== 'string') {
    return {
      isValid: false,
      issues: ['PLOP section is missing or empty'],
      details: { found: false },
    };
  }

  const plop = iep.presentLevels.trim();

  // Check minimum length (should be substantive)
  if (plop.length < 50) {
    issues.push('PLOP section is too brief (must be substantive description)');
  }

  // Check for required components
  const hasAcademic = /academic|reading|math|writing/i.test(plop);
  const hasFunctional = /functional|behavior|social|communication/i.test(plop);

  if (!hasAcademic) {
    issues.push('PLOP must address academic achievement');
  }

  if (!hasFunctional) {
    issues.push('PLOP must address functional performance');
  }

  // Check for data-based statements
  const hasData = /\d+%|\d+ out of \d+|score|grade level/i.test(plop);
  if (!hasData) {
    issues.push('PLOP should include measurable data or current performance levels');
  }

  return {
    isValid: issues.length === 0,
    issues,
    details: {
      found: true,
      length: plop.length,
      hasAcademic,
      hasFunctional,
      hasData,
    },
  };
}

/**
 * Validate measurable goals
 * 34 CFR §300.320(a)(2) requirement
 */
export function validateMeasurableGoals(iep: any): {
  isValid: boolean;
  issues: string[];
  details: any;
} {
  const issues: string[] = [];

  // Check if goals exist
  if (!iep.goals || !Array.isArray(iep.goals) || iep.goals.length === 0) {
    return {
      isValid: false,
      issues: ['No goals found in IEP'],
      details: { goalCount: 0, measurableCount: 0 },
    };
  }

  let measurableCount = 0;
  const nonMeasurableGoals: string[] = [];

  for (const goal of iep.goals) {
    if (!goal.description || typeof goal.description !== 'string') {
      nonMeasurableGoals.push(goal.id || 'Unknown goal');
      continue;
    }

    // Check for measurable criteria
    const isMeasurable = checkGoalMeasurability(goal.description);

    if (isMeasurable) {
      measurableCount++;
    } else {
      nonMeasurableGoals.push(goal.id || goal.description.substring(0, 50));
    }
  }

  if (measurableCount === 0) {
    issues.push('No measurable goals found');
  }

  if (nonMeasurableGoals.length > 0) {
    issues.push(
      `${nonMeasurableGoals.length} goal(s) lack measurable criteria: ${nonMeasurableGoals.slice(0, 3).join(', ')}`
    );
  }

  return {
    isValid: issues.length === 0,
    issues,
    details: {
      goalCount: iep.goals.length,
      measurableCount,
      nonMeasurableCount: nonMeasurableGoals.length,
    },
  };
}

/**
 * Check if a goal description is measurable
 * Must include: observable behavior + criteria + condition
 */
function checkGoalMeasurability(description: string): boolean {
  // Check for percentage criteria (e.g., "80%", "90% accuracy")
  const hasPercentage = /\d+%/.test(description);

  // Check for ratio criteria (e.g., "4 out of 5 trials")
  const hasRatio = /\d+\s+out of\s+\d+/.test(description);

  // Check for numeric criteria (e.g., "with 3 or fewer errors")
  const hasNumericCriteria = /\d+\s+(or fewer|or more|consecutive)/.test(description);

  // Check for observable verbs (indicate measurable behavior)
  const observableVerbs = [
    'demonstrate',
    'identify',
    'write',
    'read',
    'solve',
    'complete',
    'answer',
    'calculate',
    'explain',
  ];
  const hasObservableVerb = observableVerbs.some((verb) =>
    description.toLowerCase().includes(verb)
  );

  // Goal is measurable if it has:
  // 1. An observable verb, AND
  // 2. Some form of measurable criteria
  return hasObservableVerb && (hasPercentage || hasRatio || hasNumericCriteria);
}

/**
 * Validate progress measurement
 * 34 CFR §300.320(a)(3) requirement
 */
export function validateProgressMeasurement(iep: any): {
  isValid: boolean;
  issues: string[];
  details: any;
} {
  const issues: string[] = [];

  if (!iep.progressMeasurement || typeof iep.progressMeasurement !== 'string') {
    return {
      isValid: false,
      issues: ['Progress measurement description is missing'],
      details: { found: false },
    };
  }

  const progressText = iep.progressMeasurement.toLowerCase();

  // Check for method description
  const hasMethods = /measure|assess|track|monitor|observe|test|evaluate/i.test(
    progressText
  );
  if (!hasMethods) {
    issues.push('Must describe HOW progress will be measured');
  }

  // Check for reporting schedule
  const hasSchedule = /weekly|monthly|quarterly|semester|progress report/i.test(
    progressText
  );
  if (!hasSchedule) {
    issues.push('Must specify WHEN progress reports will be provided to parents');
  }

  return {
    isValid: issues.length === 0,
    issues,
    details: {
      found: true,
      hasMethods,
      hasSchedule,
    },
  };
}

/**
 * Validate transition services (for students 16+)
 * 34 CFR §300.320(b) requirement
 */
export function validateTransitionServices(iep: any): {
  isValid: boolean;
  issues: string[];
  details: any;
  required: boolean;
} {
  const studentAge = iep.studentAge || 0;

  // Transition services required for age 16+
  if (studentAge < 16) {
    return {
      isValid: true,
      issues: [],
      details: { required: false, reason: 'Student under age 16' },
      required: false,
    };
  }

  const issues: string[] = [];

  // Check for transition plan
  if (!iep.transitionPlan && !iep.hasTransitionPlan) {
    issues.push('Transition plan required for students age 16 and older');
  }

  // Check for postsecondary goals
  if (!iep.postsecondaryGoals) {
    issues.push(
      'Measurable postsecondary goals required (education, employment, independent living)'
    );
  }

  // Check for transition services
  if (!iep.transitionServices || !Array.isArray(iep.transitionServices)) {
    issues.push('Transition services must be specified');
  }

  return {
    isValid: issues.length === 0,
    issues,
    details: {
      studentAge,
      hasTransitionPlan: !!iep.transitionPlan,
      hasPostsecondaryGoals: !!iep.postsecondaryGoals,
      transitionServicesCount: iep.transitionServices?.length || 0,
    },
    required: true,
  };
}

/**
 * Validate state code
 */
export function validateStateCode(state: string): boolean {
  const validStates = [
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
    'DC', // District of Columbia
  ];

  return validStates.includes(state.toUpperCase());
}

/**
 * Validate IEP ID format
 */
export function validateIEPId(iepId: string): boolean {
  // UUID format or custom ID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const customIdRegex = /^iep-[a-zA-Z0-9-]+$/;

  return uuidRegex.test(iepId) || customIdRegex.test(iepId);
}

/**
 * Sanitize and validate compliance check input
 */
export function validateComplianceCheckInput(input: {
  iepId: string;
  state: string;
  generatePDF?: boolean;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate IEP ID
  if (!input.iepId) {
    errors.push('IEP ID is required');
  } else if (!validateIEPId(input.iepId)) {
    errors.push('Invalid IEP ID format');
  }

  // Validate state code
  if (!input.state) {
    errors.push('State code is required');
  } else if (!validateStateCode(input.state)) {
    errors.push(`Invalid state code: ${input.state}`);
  }

  // Validate generatePDF flag
  if (input.generatePDF !== undefined && typeof input.generatePDF !== 'boolean') {
    errors.push('generatePDF must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate compliance score with detailed breakdown
 * Score formula:
 * - Start at 100
 * - Deduct 15 points per critical issue
 * - Deduct 5 points per warning
 * - Minimum score: 0
 */
export function calculateComplianceScore(
  criticalIssues: number,
  warnings: number
): {
  score: number;
  breakdown: {
    startingScore: number;
    criticalDeduction: number;
    warningDeduction: number;
    finalScore: number;
  };
} {
  const CRITICAL_DEDUCTION = 15;
  const WARNING_DEDUCTION = 5;

  const startingScore = 100;
  const criticalDeduction = criticalIssues * CRITICAL_DEDUCTION;
  const warningDeduction = warnings * WARNING_DEDUCTION;
  const finalScore = Math.max(0, startingScore - criticalDeduction - warningDeduction);

  return {
    score: finalScore,
    breakdown: {
      startingScore,
      criticalDeduction,
      warningDeduction,
      finalScore,
    },
  };
}

/**
 * Determine overall compliance status
 */
export function determineComplianceStatus(
  criticalIssues: number,
  warnings: number
): 'compliant' | 'non-compliant' | 'needs-review' {
  if (criticalIssues > 0) {
    return 'non-compliant';
  } else if (warnings > 0) {
    return 'needs-review';
  } else {
    return 'compliant';
  }
}

/**
 * Validate compliance result before storing
 */
export function validateComplianceResult(result: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!result.iepId) errors.push('Missing iepId');
  if (!result.state) errors.push('Missing state');
  if (!result.checkedAt) errors.push('Missing checkedAt timestamp');
  if (!result.overallStatus) errors.push('Missing overallStatus');
  if (result.complianceScore === undefined || result.complianceScore === null) {
    errors.push('Missing complianceScore');
  }
  if (!Array.isArray(result.issues)) errors.push('Issues must be an array');

  // Validate score is in valid range
  if (result.complianceScore < 0 || result.complianceScore > 100) {
    errors.push('Compliance score must be between 0 and 100');
  }

  // Validate status is valid
  const validStatuses = ['compliant', 'non-compliant', 'needs-review'];
  if (!validStatuses.includes(result.overallStatus)) {
    errors.push(`Invalid status: ${result.overallStatus}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Log compliance check for audit trail
 */
export function logComplianceCheck(
  iepId: string,
  state: string,
  result: any,
  userId?: string
): void {
  logger.info('Compliance check completed', {
    iepId,
    state,
    overallStatus: result.overallStatus,
    complianceScore: result.complianceScore,
    criticalIssues: result.criticalIssueCount,
    warnings: result.warningCount,
    userId,
    timestamp: new Date().toISOString(),
  });
}
