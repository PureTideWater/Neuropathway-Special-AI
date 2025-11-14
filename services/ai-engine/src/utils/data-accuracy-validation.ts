/**
 * Data Accuracy Validation Utilities
 * Validation for data-dependent features (Progress Prediction, Voice Transcription, ROI)
 *
 * CRITICAL: Data accuracy affects IEP decisions and district renewals
 * - Inaccurate predictions lead to wrong interventions
 * - Poor transcription quality = wrong data in IEP
 * - Incorrect ROI metrics = lost trust and renewals
 */

import { logger } from './logger';

/**
 * ========================================
 * PROGRESS PREDICTION VALIDATION
 * ========================================
 */

/**
 * Validate progress prediction confidence threshold
 * Predictions with low confidence should not be used for decisions
 */
export function validatePredictionConfidence(
  confidence: number,
  predictionType: 'will_meet' | 'at_risk'
): {
  isReliable: boolean;
  issues: string[];
  recommendedAction: string;
} {
  const issues: string[] = [];
  let recommendedAction = '';

  // Confidence should be 0-100
  if (confidence < 0 || confidence > 100) {
    issues.push(`Invalid confidence value: ${confidence}. Must be 0-100`);
    return {
      isReliable: false,
      issues,
      recommendedAction: 'Fix confidence calculation',
    };
  }

  // Define reliability thresholds
  const HIGH_CONFIDENCE = 85;
  const MEDIUM_CONFIDENCE = 70;
  const LOW_CONFIDENCE = 50;

  if (confidence >= HIGH_CONFIDENCE) {
    recommendedAction = 'Prediction is reliable - proceed with recommended interventions';
  } else if (confidence >= MEDIUM_CONFIDENCE) {
    recommendedAction = 'Prediction is moderately reliable - monitor closely and validate with teacher input';
    issues.push('Medium confidence - consider collecting more data points');
  } else if (confidence >= LOW_CONFIDENCE) {
    recommendedAction = 'Low confidence - use as early warning only, do not base decisions solely on this';
    issues.push('Low confidence - insufficient data for reliable prediction');
  } else {
    recommendedAction = 'Very low confidence - do not use for decision-making';
    issues.push('Confidence too low for reliable prediction');
  }

  // Additional check: "At risk" predictions should have higher confidence threshold
  if (predictionType === 'at_risk' && confidence < MEDIUM_CONFIDENCE) {
    issues.push('At-risk predictions should have 70%+ confidence to trigger interventions');
    recommendedAction = 'Gather more data before intervening';
  }

  const isReliable = confidence >= MEDIUM_CONFIDENCE;

  return {
    isReliable,
    issues,
    recommendedAction,
  };
}

/**
 * Validate prediction has sufficient data points
 */
export function validatePredictionDataSufficiency(
  dataPointCount: number,
  daysSinceGoalStart: number
): {
  isSufficient: boolean;
  issues: string[];
  minimumRequired: number;
} {
  const issues: string[] = [];

  // Need at least 3 data points for trend analysis
  const MINIMUM_DATA_POINTS = 3;

  // Need at least 14 days of data
  const MINIMUM_DAYS = 14;

  if (dataPointCount < MINIMUM_DATA_POINTS) {
    issues.push(
      `Only ${dataPointCount} data point(s) - need at least ${MINIMUM_DATA_POINTS} for reliable prediction`
    );
  }

  if (daysSinceGoalStart < MINIMUM_DAYS) {
    issues.push(
      `Only ${daysSinceGoalStart} days since goal started - need at least ${MINIMUM_DAYS} days`
    );
  }

  const isSufficient = dataPointCount >= MINIMUM_DATA_POINTS && daysSinceGoalStart >= MINIMUM_DAYS;

  return {
    isSufficient,
    issues,
    minimumRequired: MINIMUM_DATA_POINTS,
  };
}

/**
 * Validate prediction factors are reasonable
 */
export function validatePredictionFactors(factors: {
  progress_rate: number;
  required_rate: number;
  attendance_rate: number;
  accommodation_usage: number;
}): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Validate rates are percentages (0-1)
  if (factors.progress_rate < 0) {
    issues.push('Progress rate cannot be negative');
  }

  if (factors.attendance_rate < 0 || factors.attendance_rate > 1) {
    issues.push(`Attendance rate ${factors.attendance_rate} must be 0-1`);
  }

  if (factors.accommodation_usage < 0 || factors.accommodation_usage > 1) {
    issues.push(`Accommodation usage ${factors.accommodation_usage} must be 0-1`);
  }

  if (factors.required_rate <= 0) {
    issues.push('Required rate must be positive');
  }

  const isValid = issues.length === 0;

  return { isValid, issues };
}

/**
 * ========================================
 * VOICE TRANSCRIPTION VALIDATION
 * ========================================
 */

/**
 * Validate audio quality before transcription
 */
export function validateAudioQuality(audioMetadata: {
  duration_seconds: number;
  sample_rate: number;
  file_size_bytes: number;
  format: string;
}): {
  isAcceptable: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Duration checks
  if (audioMetadata.duration_seconds < 1) {
    issues.push('Audio too short (< 1 second) - may be empty');
  } else if (audioMetadata.duration_seconds > 3600) {
    warnings.push('Audio is very long (> 1 hour) - consider splitting for better accuracy');
  }

  // Sample rate checks (higher = better quality)
  const MINIMUM_SAMPLE_RATE = 8000; // 8kHz minimum for speech
  const RECOMMENDED_SAMPLE_RATE = 16000; // 16kHz recommended

  if (audioMetadata.sample_rate < MINIMUM_SAMPLE_RATE) {
    issues.push(
      `Sample rate ${audioMetadata.sample_rate}Hz is too low - minimum ${MINIMUM_SAMPLE_RATE}Hz required`
    );
  } else if (audioMetadata.sample_rate < RECOMMENDED_SAMPLE_RATE) {
    warnings.push(
      `Sample rate ${audioMetadata.sample_rate}Hz is low - ${RECOMMENDED_SAMPLE_RATE}Hz recommended for better accuracy`
    );
  }

  // File size check
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (Whisper API limit)
  if (audioMetadata.file_size_bytes > MAX_FILE_SIZE) {
    issues.push(`File size ${(audioMetadata.file_size_bytes / 1024 / 1024).toFixed(1)}MB exceeds 25MB limit`);
  }

  // Format check
  const SUPPORTED_FORMATS = ['mp3', 'mp4', 'm4a', 'wav', 'webm', 'flac'];
  if (!SUPPORTED_FORMATS.includes(audioMetadata.format.toLowerCase())) {
    issues.push(`Format "${audioMetadata.format}" may not be supported - use: ${SUPPORTED_FORMATS.join(', ')}`);
  }

  const isAcceptable = issues.length === 0;

  return { isAcceptable, issues, warnings };
}

/**
 * Validate transcription confidence scores
 */
export function validateTranscriptionConfidence(
  segments: Array<{ text: string; confidence?: number }>
): {
  overallConfidence: number;
  lowConfidenceSegments: number;
  requiresReview: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  let totalConfidence = 0;
  let segmentsWithConfidence = 0;
  let lowConfidenceSegments = 0;

  const LOW_CONFIDENCE_THRESHOLD = 0.7;

  for (const segment of segments) {
    if (segment.confidence !== undefined) {
      totalConfidence += segment.confidence;
      segmentsWithConfidence++;

      if (segment.confidence < LOW_CONFIDENCE_THRESHOLD) {
        lowConfidenceSegments++;
      }
    }
  }

  const overallConfidence =
    segmentsWithConfidence > 0 ? totalConfidence / segmentsWithConfidence : 0;

  const lowConfidencePercentage =
    segments.length > 0 ? lowConfidenceSegments / segments.length : 0;

  if (lowConfidencePercentage > 0.3) {
    issues.push(
      `${(lowConfidencePercentage * 100).toFixed(1)}% of segments have low confidence - manual review recommended`
    );
  }

  if (overallConfidence < 0.8) {
    issues.push(`Overall confidence ${(overallConfidence * 100).toFixed(1)}% is below 80% threshold`);
  }

  const requiresReview = overallConfidence < 0.8 || lowConfidencePercentage > 0.3;

  return {
    overallConfidence,
    lowConfidenceSegments,
    requiresReview,
    issues,
  };
}

/**
 * Validate transcription output for FERPA compliance
 */
export function validateTranscriptionPrivacy(transcriptionText: string): {
  hasPrivacyConcerns: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check for potential PII in transcription
  const hasSSN = /\d{3}-\d{2}-\d{4}/.test(transcriptionText);
  const hasPhoneNumber = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(transcriptionText);
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(transcriptionText);

  if (hasSSN) {
    warnings.push('Potential SSN detected in transcription - verify before storing');
  }
  if (hasPhoneNumber) {
    warnings.push('Phone number detected in transcription');
  }
  if (hasEmail) {
    warnings.push('Email address detected in transcription');
  }

  const hasPrivacyConcerns = warnings.length > 0;

  return { hasPrivacyConcerns, warnings };
}

/**
 * ========================================
 * ACCOMMODATION RECOMMENDATION VALIDATION
 * ========================================
 */

/**
 * Validate accommodation has research evidence
 */
export function validateAccommodationEvidence(accommodation: {
  name: string;
  evidenceLevel: 'strong' | 'moderate' | 'limited' | 'none';
  researchCitations?: string[];
}): {
  isEvidenceBased: boolean;
  issues: string[];
  recommendedUse: string;
} {
  const issues: string[] = [];
  let recommendedUse = '';

  switch (accommodation.evidenceLevel) {
    case 'strong':
      recommendedUse = 'Evidence-based accommodation - recommended for use';
      break;

    case 'moderate':
      recommendedUse = 'Moderate evidence - consider for use with monitoring';
      issues.push('Moderate evidence level - monitor effectiveness closely');
      break;

    case 'limited':
      recommendedUse = 'Limited evidence - use with caution and close monitoring';
      issues.push('Limited research support - document rationale for use');
      break;

    case 'none':
      recommendedUse = 'No research evidence - not recommended unless strong justification';
      issues.push('CRITICAL: No research evidence for this accommodation');
      break;
  }

  // Check for citations
  if (!accommodation.researchCitations || accommodation.researchCitations.length === 0) {
    issues.push('No research citations provided - add evidence sources');
  }

  const isEvidenceBased = accommodation.evidenceLevel === 'strong' || accommodation.evidenceLevel === 'moderate';

  return {
    isEvidenceBased,
    issues,
    recommendedUse,
  };
}

/**
 * ========================================
 * ROI DASHBOARD VALIDATION
 * ========================================
 */

/**
 * Validate time savings calculation
 */
export function validateTimeSavingsCalculation(calculation: {
  tasksCompleted: number;
  avgTimeBeforeMinutes: number;
  avgTimeAfterMinutes: number;
  totalUsers: number;
}): {
  isValid: boolean;
  timeSavedHours: number;
  timeSavedPerUser: number;
  issues: string[];
  formula: string;
} {
  const issues: string[] = [];

  // Validate inputs
  if (calculation.tasksCompleted < 0) {
    issues.push('Tasks completed cannot be negative');
  }
  if (calculation.avgTimeBeforeMinutes <= 0) {
    issues.push('Average time before must be positive');
  }
  if (calculation.avgTimeAfterMinutes < 0) {
    issues.push('Average time after cannot be negative');
  }
  if (calculation.totalUsers <= 0) {
    issues.push('Total users must be positive');
  }

  // Check for unrealistic time savings
  if (calculation.avgTimeAfterMinutes > calculation.avgTimeBeforeMinutes) {
    issues.push('Time after is greater than time before - no savings achieved');
  }

  const savingsPercentage =
    ((calculation.avgTimeBeforeMinutes - calculation.avgTimeAfterMinutes) /
      calculation.avgTimeBeforeMinutes) *
    100;

  if (savingsPercentage > 90) {
    issues.push(
      `Time savings of ${savingsPercentage.toFixed(1)}% seems unrealistic - verify calculation`
    );
  }

  // Calculate total time saved
  const timeSavedMinutes =
    (calculation.avgTimeBeforeMinutes - calculation.avgTimeAfterMinutes) * calculation.tasksCompleted;
  const timeSavedHours = timeSavedMinutes / 60;
  const timeSavedPerUser = timeSavedHours / calculation.totalUsers;

  const formula = `(${calculation.avgTimeBeforeMinutes} - ${calculation.avgTimeAfterMinutes}) × ${calculation.tasksCompleted} ÷ 60 = ${timeSavedHours.toFixed(1)} hours`;

  const isValid = issues.length === 0;

  return {
    isValid,
    timeSavedHours,
    timeSavedPerUser,
    issues,
    formula,
  };
}

/**
 * Validate compliance rate calculation
 */
export function validateComplianceRateCalculation(
  compliantCount: number,
  totalCount: number
): {
  isValid: boolean;
  complianceRate: number;
  issues: string[];
} {
  const issues: string[] = [];

  if (compliantCount < 0 || totalCount < 0) {
    issues.push('Counts cannot be negative');
  }

  if (compliantCount > totalCount) {
    issues.push('Compliant count cannot exceed total count');
  }

  if (totalCount === 0) {
    issues.push('Total count is zero - cannot calculate rate');
    return { isValid: false, complianceRate: 0, issues };
  }

  const complianceRate = (compliantCount / totalCount) * 100;

  const isValid = issues.length === 0;

  return {
    isValid,
    complianceRate,
    issues,
  };
}

/**
 * Validate ROI metric assumptions are documented
 */
export function validateROIAssumptions(assumptions: {
  avgSalaryPerHour?: number;
  complianceViolationCost?: number;
  parentSatisfactionWeight?: number;
}): {
  isWellDocumented: boolean;
  missingAssumptions: string[];
  recommendations: string[];
} {
  const missingAssumptions: string[] = [];
  const recommendations: string[] = [];

  if (!assumptions.avgSalaryPerHour) {
    missingAssumptions.push('Average salary per hour not specified');
    recommendations.push('Document average teacher/admin hourly rate used for time savings calculation');
  } else if (assumptions.avgSalaryPerHour < 20 || assumptions.avgSalaryPerHour > 100) {
    recommendations.push(
      `Salary assumption $${assumptions.avgSalaryPerHour}/hour seems unusual - verify`
    );
  }

  if (!assumptions.complianceViolationCost) {
    missingAssumptions.push('Compliance violation cost not specified');
    recommendations.push('Document estimated cost per compliance violation avoided');
  }

  if (!assumptions.parentSatisfactionWeight) {
    missingAssumptions.push('Parent satisfaction weighting not specified');
  }

  const isWellDocumented = missingAssumptions.length === 0;

  if (!isWellDocumented) {
    recommendations.push('Add "Assumptions" section to ROI dashboard explaining all calculation inputs');
  }

  return {
    isWellDocumented,
    missingAssumptions,
    recommendations,
  };
}

/**
 * Log validation result
 */
export function logValidation(
  feature: string,
  validationType: string,
  result: { isValid: boolean; issues?: string[]; warnings?: string[] }
): void {
  logger.info('Data accuracy validation', {
    feature,
    validationType,
    isValid: result.isValid,
    issueCount: result.issues?.length || 0,
    warningCount: result.warnings?.length || 0,
    timestamp: new Date().toISOString(),
  });
}
