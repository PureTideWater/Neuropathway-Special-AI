/**
 * FERPA Compliance Validation Utilities
 * Family Educational Rights and Privacy Act (20 U.S.C. § 1232g)
 *
 * CRITICAL: Parent portal must comply with FERPA to avoid:
 * - Federal funding loss
 * - Legal liability
 * - Data breach consequences
 *
 * Legal Foundation:
 * - 20 U.S.C. § 1232g: FERPA statute
 * - 34 CFR Part 99: FERPA regulations
 * - State privacy laws (COPPA, GDPR, CCPA where applicable)
 */

import { logger } from './logger';

/**
 * Valid parent-student relationships under FERPA
 */
export enum ParentRelationship {
  BIOLOGICAL_PARENT = 'biological_parent',
  LEGAL_GUARDIAN = 'legal_guardian',
  CUSTODIAL_PARENT = 'custodial_parent',
  FOSTER_PARENT = 'foster_parent',
  STUDENT_18_PLUS = 'student_18_plus', // Student has rights if 18+
  SURROGATE_PARENT = 'surrogate_parent',
}

/**
 * FERPA-protected data categories
 */
export enum ProtectedDataCategory {
  EDUCATION_RECORDS = 'education_records', // IEPs, grades, assessments
  HEALTH_RECORDS = 'health_records', // Medical info, diagnoses
  DISCIPLINARY_RECORDS = 'disciplinary_records',
  SPECIAL_ED_RECORDS = 'special_ed_records', // IEPs, evaluations
  DIRECTORY_INFO = 'directory_info', // Can be disclosed if parent doesn't opt out
  PERSONALLY_IDENTIFIABLE = 'personally_identifiable', // SSN, DOB, etc.
}

/**
 * Required consent types under FERPA
 */
export interface FERPAConsent {
  consentId: string;
  parentId: string;
  studentId: string;
  consentType: 'electronic_access' | 'data_sharing' | 'third_party_disclosure' | 'directory_opt_out';
  consentGiven: boolean;
  consentDate: Date;
  expirationDate?: Date;
  revokedDate?: Date;
  ipAddress: string; // For audit trail
  userAgent: string; // For audit trail
  signatureData?: string; // Electronic signature if required
}

/**
 * Data access log entry (required by FERPA 34 CFR §99.32)
 */
export interface DataAccessLog {
  logId: string;
  userId: string;
  userRole: 'parent' | 'teacher' | 'admin' | 'counselor' | 'third_party';
  studentId: string;
  dataCategory: ProtectedDataCategory;
  accessType: 'view' | 'download' | 'modify' | 'delete' | 'share';
  recordsAccessed: string[]; // List of record IDs
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  legitimateInterest: string; // Why access was granted
  consentId?: string; // If consent was required
}

/**
 * Validate parent has legal right to access student data
 * 34 CFR §99.3 - Definition of "parent"
 */
export function validateParentAuthorization(
  parentId: string,
  studentId: string,
  relationship: ParentRelationship,
  studentAge: number
): {
  isAuthorized: boolean;
  issues: string[];
  details: {
    relationship: ParentRelationship;
    studentAge: number;
    requiresCustodyDoc: boolean;
    requiresCourtOrder: boolean;
  };
} {
  const issues: string[] = [];
  let isAuthorized = false;
  let requiresCustodyDoc = false;
  let requiresCourtOrder = false;

  // If student is 18+, they have the rights (not parent)
  if (studentAge >= 18) {
    if (relationship !== ParentRelationship.STUDENT_18_PLUS) {
      issues.push('Student is 18+ years old - parental rights transfer to student under FERPA');
      issues.push('Parent access requires written consent from student');
    } else {
      isAuthorized = true; // Student accessing their own records
    }
    return {
      isAuthorized,
      issues,
      details: { relationship, studentAge, requiresCustodyDoc, requiresCourtOrder },
    };
  }

  // Validate relationship type
  switch (relationship) {
    case ParentRelationship.BIOLOGICAL_PARENT:
    case ParentRelationship.LEGAL_GUARDIAN:
      // Generally authorized unless court order restricts
      isAuthorized = true;
      break;

    case ParentRelationship.CUSTODIAL_PARENT:
      // Authorized - but should verify custody documents
      isAuthorized = true;
      requiresCustodyDoc = true;
      issues.push('Custody documentation should be verified to confirm access rights');
      break;

    case ParentRelationship.FOSTER_PARENT:
      // Authorized if documented
      isAuthorized = true;
      requiresCourtOrder = true;
      issues.push('Foster parent authorization requires court documentation');
      break;

    case ParentRelationship.SURROGATE_PARENT:
      // Authorized if appointed by district
      isAuthorized = true;
      requiresCourtOrder = true;
      issues.push('Surrogate parent must have official appointment documentation');
      break;

    default:
      issues.push(`Unknown relationship type: ${relationship}`);
      isAuthorized = false;
  }

  return {
    isAuthorized,
    issues,
    details: {
      relationship,
      studentAge,
      requiresCustodyDoc,
      requiresCourtOrder,
    },
  };
}

/**
 * Validate consent is valid and not expired
 * 34 CFR §99.30 - Prior consent required
 */
export function validateConsent(consent: FERPAConsent): {
  isValid: boolean;
  issues: string[];
  details: {
    isExpired: boolean;
    isRevoked: boolean;
    daysUntilExpiration?: number;
  };
} {
  const issues: string[] = [];
  const now = new Date();

  // Check if revoked
  const isRevoked = !!consent.revokedDate;
  if (isRevoked) {
    issues.push(`Consent was revoked on ${consent.revokedDate?.toISOString()}`);
  }

  // Check if expired
  let isExpired = false;
  let daysUntilExpiration: number | undefined;

  if (consent.expirationDate) {
    isExpired = now > consent.expirationDate;
    if (isExpired) {
      issues.push(`Consent expired on ${consent.expirationDate.toISOString()}`);
    } else {
      daysUntilExpiration = Math.floor(
        (consent.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiration <= 30) {
        issues.push(`Consent expires in ${daysUntilExpiration} days - renewal recommended`);
      }
    }
  }

  // Consent must be actively given (not just absence of objection)
  if (!consent.consentGiven) {
    issues.push('Consent was not explicitly given');
  }

  const isValid = consent.consentGiven && !isRevoked && !isExpired;

  return {
    isValid,
    issues,
    details: {
      isExpired,
      isRevoked,
      daysUntilExpiration,
    },
  };
}

/**
 * Validate data access request complies with FERPA
 */
export function validateDataAccessRequest(
  userId: string,
  studentId: string,
  dataCategory: ProtectedDataCategory,
  parentConsent?: FERPAConsent,
  studentAge: number = 10
): {
  isAllowed: boolean;
  requiresConsent: boolean;
  issues: string[];
  legitimateInterest?: string;
} {
  const issues: string[] = [];
  let isAllowed = false;
  let requiresConsent = false;
  let legitimateInterest: string | undefined;

  // Directory information can be disclosed unless parent opts out
  if (dataCategory === ProtectedDataCategory.DIRECTORY_INFO) {
    if (parentConsent?.consentType === 'directory_opt_out' && parentConsent.consentGiven) {
      issues.push('Parent has opted out of directory information disclosure');
      isAllowed = false;
    } else {
      isAllowed = true;
      legitimateInterest = 'Directory information - no consent required unless opted out';
    }
    return { isAllowed, requiresConsent: false, issues, legitimateInterest };
  }

  // All other education records require authorization
  requiresConsent = true;

  // Check if consent exists and is valid
  if (!parentConsent) {
    issues.push('Access to education records requires parent consent');
    issues.push('34 CFR §99.30: Prior written consent required for disclosure');
    isAllowed = false;
  } else {
    const consentValidation = validateConsent(parentConsent);
    if (!consentValidation.isValid) {
      issues.push(...consentValidation.issues);
      isAllowed = false;
    } else {
      isAllowed = true;
      legitimateInterest = `Parent consent granted on ${parentConsent.consentDate.toISOString()}`;
    }
  }

  // Special rules for students 18+
  if (studentAge >= 18 && !isAllowed) {
    issues.push('Student is 18+ - parent access requires student consent');
  }

  return {
    isAllowed,
    requiresConsent,
    issues,
    legitimateInterest,
  };
}

/**
 * Create data access log entry (required by 34 CFR §99.32)
 * FERPA requires maintaining record of requests for disclosure
 */
export function createDataAccessLog(
  userId: string,
  userRole: string,
  studentId: string,
  dataCategory: ProtectedDataCategory,
  accessType: string,
  recordsAccessed: string[],
  ipAddress: string,
  userAgent: string,
  legitimateInterest: string,
  consentId?: string
): DataAccessLog {
  const log: DataAccessLog = {
    logId: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    userRole: userRole as any,
    studentId,
    dataCategory,
    accessType: accessType as any,
    recordsAccessed,
    timestamp: new Date(),
    ipAddress,
    userAgent,
    legitimateInterest,
    consentId,
  };

  logger.info('FERPA data access logged', {
    userId,
    studentId,
    dataCategory,
    accessType,
    timestamp: log.timestamp.toISOString(),
  });

  return log;
}

/**
 * Validate data access logs exist for student
 * Required for FERPA compliance audits
 */
export function validateAccessLogExists(
  studentId: string,
  logs: DataAccessLog[]
): {
  isCompliant: boolean;
  issues: string[];
  details: {
    totalAccesses: number;
    uniqueUsers: number;
    dataCategories: Set<ProtectedDataCategory>;
  };
} {
  const issues: string[] = [];

  const studentLogs = logs.filter((log) => log.studentId === studentId);

  if (studentLogs.length === 0) {
    issues.push('No access logs found for student - FERPA requires maintaining access records');
  }

  const uniqueUsers = new Set(studentLogs.map((log) => log.userId)).size;
  const dataCategories = new Set(studentLogs.map((log) => log.dataCategory));

  // Check for suspicious access patterns
  if (uniqueUsers > 20) {
    issues.push(`High number of unique users (${uniqueUsers}) accessing student records - review for unauthorized access`);
  }

  // Check for recent access (should have some activity if portal is in use)
  const recentLogs = studentLogs.filter((log) => {
    const daysSinceAccess = (Date.now() - log.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceAccess <= 90;
  });

  if (studentLogs.length > 0 && recentLogs.length === 0) {
    issues.push('No access in last 90 days - consider archiving inactive records');
  }

  return {
    isCompliant: studentLogs.length > 0,
    issues,
    details: {
      totalAccesses: studentLogs.length,
      uniqueUsers,
      dataCategories,
    },
  };
}

/**
 * Validate third-party data sharing request
 * 34 CFR §99.31 - Conditions for disclosure without consent
 */
export function validateThirdPartyDisclosure(
  thirdPartyName: string,
  purpose: string,
  hasSchoolOfficialStatus: boolean,
  hasLegitimateEducationalInterest: boolean,
  hasParentConsent: boolean
): {
  isAllowed: boolean;
  issues: string[];
  requiresConsent: boolean;
} {
  const issues: string[] = [];
  let isAllowed = false;
  let requiresConsent = true;

  // School officials with legitimate educational interest (no consent needed)
  if (hasSchoolOfficialStatus && hasLegitimateEducationalInterest) {
    isAllowed = true;
    requiresConsent = false;
    logger.info('Third-party disclosure allowed - school official exception', {
      thirdParty: thirdPartyName,
      purpose,
    });
  }
  // Parent consent provided
  else if (hasParentConsent) {
    isAllowed = true;
    requiresConsent = true;
    logger.info('Third-party disclosure allowed - parent consent', {
      thirdParty: thirdPartyName,
      purpose,
    });
  }
  // Not allowed
  else {
    issues.push('Third-party disclosure requires parent consent under 34 CFR §99.30');
    issues.push(`Third party: ${thirdPartyName}, Purpose: ${purpose}`);
    isAllowed = false;
  }

  return {
    isAllowed,
    issues,
    requiresConsent,
  };
}

/**
 * Validate security measures for electronic access
 * FERPA requires reasonable security measures
 */
export function validateSecurityMeasures(measures: {
  hasEncryptionAtRest: boolean;
  hasEncryptionInTransit: boolean;
  hasMFAEnabled: boolean;
  hasSessionTimeout: boolean;
  sessionTimeoutMinutes?: number;
  hasPasswordComplexity: boolean;
  hasAuditLogging: boolean;
}): {
  isCompliant: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Required security measures
  if (!measures.hasEncryptionInTransit) {
    issues.push('CRITICAL: Encryption in transit (HTTPS/TLS) is required for FERPA compliance');
  }

  if (!measures.hasEncryptionAtRest) {
    issues.push('Data at rest encryption is strongly recommended for FERPA compliance');
  }

  if (!measures.hasAuditLogging) {
    issues.push('CRITICAL: Audit logging is required under 34 CFR §99.32');
  }

  // Recommended security measures
  if (!measures.hasMFAEnabled) {
    recommendations.push('Enable multi-factor authentication for enhanced security');
  }

  if (!measures.hasSessionTimeout) {
    recommendations.push('Implement session timeout to prevent unauthorized access');
  } else if (measures.sessionTimeoutMinutes && measures.sessionTimeoutMinutes > 30) {
    recommendations.push('Session timeout should be 30 minutes or less for sensitive education records');
  }

  if (!measures.hasPasswordComplexity) {
    recommendations.push('Enforce password complexity requirements');
  }

  const isCompliant =
    measures.hasEncryptionInTransit &&
    measures.hasAuditLogging &&
    measures.hasSessionTimeout;

  return {
    isCompliant,
    issues,
    recommendations,
  };
}

/**
 * Generate FERPA compliance report for audit
 */
export function generateFERPAComplianceReport(data: {
  totalParents: number;
  parentsWithConsent: number;
  totalAccessLogs: number;
  securityMeasures: any;
  consentExpiringCount: number;
  unauthorizedAccessAttempts: number;
}): {
  overallCompliance: 'compliant' | 'needs_attention' | 'non_compliant';
  score: number;
  findings: string[];
  recommendations: string[];
} {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Consent compliance
  const consentRate = data.parentsWithConsent / data.totalParents;
  if (consentRate < 0.95) {
    findings.push(`Only ${(consentRate * 100).toFixed(1)}% of parents have valid consent - target is 95%+`);
    score -= 15;
  }

  // Access logging
  if (data.totalAccessLogs === 0) {
    findings.push('CRITICAL: No access logs found - 34 CFR §99.32 requires maintaining access records');
    score -= 30;
  }

  // Security measures
  const securityCheck = validateSecurityMeasures(data.securityMeasures);
  if (!securityCheck.isCompliant) {
    findings.push(...securityCheck.issues);
    score -= 25;
  }
  recommendations.push(...securityCheck.recommendations);

  // Expiring consents
  if (data.consentExpiringCount > 0) {
    findings.push(`${data.consentExpiringCount} consent(s) expiring within 30 days - renewal needed`);
    recommendations.push('Implement automated consent renewal reminders');
  }

  // Unauthorized access
  if (data.unauthorizedAccessAttempts > 0) {
    findings.push(`${data.unauthorizedAccessAttempts} unauthorized access attempts detected`);
    score -= 10;
    recommendations.push('Review access controls and investigate unauthorized attempts');
  }

  let overallCompliance: 'compliant' | 'needs_attention' | 'non_compliant';
  if (score >= 85) overallCompliance = 'compliant';
  else if (score >= 60) overallCompliance = 'needs_attention';
  else overallCompliance = 'non_compliant';

  return {
    overallCompliance,
    score: Math.max(0, score),
    findings,
    recommendations,
  };
}
