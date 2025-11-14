/**
 * State Compliance Checker Service
 * Validates IEPs against IDEA federal requirements and state-specific regulations
 *
 * BUSINESS LOGIC:
 * - Federal IDEA compliance (universal)
 * - State-specific requirements (50 states + DC + territories)
 * - AI-powered analysis of compliance gaps
 * - Automated remediation suggestions
 *
 * COMPETITIVE ADVANTAGE:
 * - Reduces legal risk for districts
 * - Automated compliance = premium pricing tier
 * - Patent opportunity: AI compliance checking for IEPs
 */

import OpenAI from 'openai';
import { logger } from '../utils/logger';
import {
  validateComplianceCheckInput,
  validateIEPStructure,
  validatePLOP,
  validateMeasurableGoals,
  validateProgressMeasurement,
  validateTransitionServices,
  calculateComplianceScore,
  determineComplianceStatus,
  validateComplianceResult,
  logComplianceCheck,
} from '../utils/compliance-validation';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Federal IDEA Requirements (applies to all states)
const FEDERAL_REQUIREMENTS = [
  {
    id: 'PLOP',
    name: 'Present Levels of Performance',
    description: 'IEP must include present levels of academic achievement and functional performance',
    severity: 'critical',
    citation: '34 CFR §300.320(a)(1)',
  },
  {
    id: 'MEASURABLE_GOALS',
    name: 'Measurable Annual Goals',
    description: 'Goals must be measurable and include academic and functional goals',
    severity: 'critical',
    citation: '34 CFR §300.320(a)(2)',
  },
  {
    id: 'PROGRESS_MEASUREMENT',
    name: 'Progress Measurement',
    description: 'Description of how progress will be measured and when reports will be provided',
    severity: 'critical',
    citation: '34 CFR §300.320(a)(3)',
  },
  {
    id: 'SPECIAL_ED_SERVICES',
    name: 'Special Education Services',
    description: 'Statement of special education and related services to be provided',
    severity: 'critical',
    citation: '34 CFR §300.320(a)(4)',
  },
  {
    id: 'LRE_EXPLANATION',
    name: 'LRE Explanation',
    description: 'Explanation of extent student will not participate with nondisabled children',
    severity: 'warning',
    citation: '34 CFR §300.320(a)(5)',
  },
  {
    id: 'ACCOMMODATIONS',
    name: 'Accommodations',
    description: 'Individual accommodations necessary to measure academic achievement',
    severity: 'warning',
    citation: '34 CFR §300.320(a)(6)',
  },
  {
    id: 'TRANSITION_SERVICES',
    name: 'Transition Services (Age 16+)',
    description: 'Transition services and postsecondary goals for students 16 and older',
    severity: 'critical',
    citation: '34 CFR §300.320(b)',
  },
];

// State-specific requirements (sample for major states)
const STATE_REQUIREMENTS: Record<string, any[]> = {
  CA: [
    {
      id: 'CA_TRIENNIAL',
      name: 'Triennial Assessment',
      description: 'California requires reassessment at least once every 3 years',
      severity: 'critical',
      citation: 'Cal. Ed. Code §56381',
    },
    {
      id: 'CA_DIS_CATEGORY',
      name: 'Disability Category',
      description: 'Must specify primary disability category from California list',
      severity: 'warning',
      citation: 'Cal. Ed. Code §56026',
    },
  ],
  TX: [
    {
      id: 'TX_ARD_COMMITTEE',
      name: 'ARD Committee',
      description: 'Texas ARD committee must include all required members',
      severity: 'critical',
      citation: '19 TAC §89.1050',
    },
    {
      id: 'TX_BEHAVIOR_PLAN',
      name: 'Behavior Intervention Plan',
      description: 'Required if behavior impedes learning',
      severity: 'warning',
      citation: '19 TAC §89.1053',
    },
  ],
  NY: [
    {
      id: 'NY_ANNUAL_REVIEW',
      name: 'Annual Review',
      description: 'New York requires annual review and parent notification',
      severity: 'critical',
      citation: '8 NYCRR §200.4(b)',
    },
    {
      id: 'NY_12_MONTH',
      name: '12-Month Services',
      description: 'Must consider need for 12-month school year services',
      severity: 'warning',
      citation: '8 NYCRR §200.6(k)',
    },
  ],
  // Add more states as needed (FL, IL, PA, OH, GA, NC, MI, NJ, VA, etc.)
};

export interface ComplianceIssue {
  ruleId: string;
  ruleName: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  citation: string;
  finding: string;
  remediation: string;
}

export interface ComplianceResult {
  iepId: string;
  state: string;
  checkedAt: Date;
  overallStatus: 'compliant' | 'non-compliant' | 'needs-review';
  complianceScore: number; // 0-100
  issues: ComplianceIssue[];
  criticalIssueCount: number;
  warningCount: number;
  federalCompliance: boolean;
  stateCompliance: boolean;
  reportId?: string;
  pdfUrl?: string;
}

/**
 * Check IEP compliance against state and federal requirements
 * BULLETPROOF: Full validation, error handling, audit logging
 */
export async function checkIEPCompliance(
  iepId: string,
  state: string,
  generatePDF: boolean = false
): Promise<ComplianceResult> {
  // STEP 1: Validate input parameters
  const inputValidation = validateComplianceCheckInput({ iepId, state, generatePDF });
  if (!inputValidation.valid) {
    const errorMessage = `Invalid input: ${inputValidation.errors.join(', ')}`;
    logger.error('Compliance check failed: invalid input', { iepId, state, errors: inputValidation.errors });
    throw new Error(errorMessage);
  }

  logger.info('Starting compliance check', { iepId, state, generatePDF });

  try {
    // STEP 2: Fetch IEP from database with error handling
    const iep = await fetchIEPData(iepId);

    if (!iep) {
      throw new Error(`IEP not found: ${iepId}`);
    }

    // STEP 3: Validate IEP structure
    const structureIssues = validateIEPStructure(iep);
    if (structureIssues.length > 0) {
      logger.warn('IEP structure validation issues', { iepId, missingSections: structureIssues });
    }

    // STEP 4: Check federal requirements with detailed validation
    const federalIssues = await checkFederalCompliance(iep);

    // STEP 5: Check state-specific requirements
    const stateIssues = await checkStateCompliance(iep, state);

    // STEP 6: Combine all issues
    const allIssues = [...federalIssues, ...stateIssues];

    // STEP 7: Calculate compliance metrics using validated formula
    const criticalIssueCount = allIssues.filter((i) => i.severity === 'critical').length;
    const warningCount = allIssues.filter((i) => i.severity === 'warning').length;

    const scoreCalculation = calculateComplianceScore(criticalIssueCount, warningCount);
    const complianceScore = scoreCalculation.score;
    const overallStatus = determineComplianceStatus(criticalIssueCount, warningCount);

    // STEP 8: Build result object
    const result: ComplianceResult = {
      iepId,
      state,
      checkedAt: new Date(),
      overallStatus,
      complianceScore,
      issues: allIssues,
    criticalIssueCount,
    warningCount,
    federalCompliance: federalIssues.filter((i) => i.severity === 'critical').length === 0,
    stateCompliance: stateIssues.filter((i) => i.severity === 'critical').length === 0,
  };

    // STEP 9: Validate result before storing
    const resultValidation = validateComplianceResult(result);
    if (!resultValidation.valid) {
      logger.error('Compliance result validation failed', {
        iepId,
        errors: resultValidation.errors
      });
      throw new Error(`Result validation failed: ${resultValidation.errors.join(', ')}`);
    }

    // STEP 10: Store result in database with error handling
    try {
      await storeComplianceResult(result);
    } catch (error) {
      logger.error('Failed to store compliance result', { iepId, error });
      // Continue even if storage fails - we still have the result
    }

    // STEP 11: Generate PDF if requested
    if (generatePDF) {
      try {
        const pdfUrl = await generatePDFReport(result);
        result.pdfUrl = pdfUrl;
      } catch (error) {
        logger.error('Failed to generate PDF report', { iepId, error });
        // Don't fail the whole check if PDF generation fails
      }
    }

    // STEP 12: Audit log for compliance
    logComplianceCheck(iepId, state, result);

    logger.info('Compliance check completed successfully', {
      iepId,
      state,
      overallStatus,
      complianceScore,
      criticalIssues: criticalIssueCount,
      warnings: warningCount,
      scoreBreakdown: scoreCalculation.breakdown,
    });

    return result;
  } catch (error) {
    logger.error('Compliance check failed', {
      iepId,
      state,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

/**
 * Generate comprehensive compliance report with AI analysis
 */
export async function generateComplianceReport(
  iepId: string,
  state: string,
  includeRemediation: boolean,
  format: 'json' | 'pdf' | 'html'
): Promise<any> {
  logger.info('Generating compliance report', { iepId, state, format });

  const complianceResult = await checkIEPCompliance(iepId, state, false);

  if (!includeRemediation) {
    return complianceResult;
  }

  // Use AI to generate detailed remediation plan
  const remediationPlan = await generateAIRemediationPlan(complianceResult);

  const report = {
    ...complianceResult,
    remediationPlan,
    executiveSummary: generateExecutiveSummary(complianceResult),
    prioritizedActions: prioritizeActions(complianceResult.issues),
    estimatedRemediationTime: calculateRemediationTime(complianceResult.issues),
  };

  if (format === 'pdf') {
    const pdfUrl = await generatePDFReport(report);
    return {
      reportId: `report-${iepId}-${Date.now()}`,
      pdfUrl,
    };
  }

  return report;
}

/**
 * Get compliance check history for an IEP
 */
export async function getComplianceHistory(
  iepId: string,
  limit: number = 50
): Promise<any[]> {
  logger.info('Fetching compliance history', { iepId, limit });

  // In production: Query database
  // SELECT * FROM compliance_reports WHERE iep_id = $1 ORDER BY checked_at DESC LIMIT $2

  return [
    {
      id: '1',
      iepId,
      checkedAt: new Date('2024-11-01'),
      complianceScore: 85,
      overallStatus: 'needs-review',
      criticalIssues: 1,
      warnings: 3,
    },
    {
      id: '2',
      iepId,
      checkedAt: new Date('2024-10-15'),
      complianceScore: 78,
      overallStatus: 'non-compliant',
      criticalIssues: 2,
      warnings: 5,
    },
  ];
}

/**
 * Get state-specific requirements
 */
export async function getStateRequirements(
  state: string,
  category?: string
): Promise<any[]> {
  const federalReqs = FEDERAL_REQUIREMENTS;
  const stateReqs = STATE_REQUIREMENTS[state] || [];

  let allReqs = [...federalReqs, ...stateReqs];

  if (category) {
    allReqs = allReqs.filter((req) => req.id.toLowerCase().includes(category.toLowerCase()));
  }

  return allReqs;
}

/**
 * Bulk compliance check for multiple IEPs
 */
export async function bulkComplianceCheck(
  districtId: string,
  state: string,
  iepIds?: string[],
  includeAllActiveIEPs: boolean = false
): Promise<any> {
  logger.info('Starting bulk compliance check', { districtId, state });

  // In production: Fetch IEP IDs from database if includeAllActiveIEPs
  const targetIepIds = iepIds || (includeAllActiveIEPs ? await fetchActiveIEPIds(districtId) : []);

  const results: ComplianceResult[] = [];

  for (const iepId of targetIepIds) {
    try {
      const result = await checkIEPCompliance(iepId, state, false);
      results.push(result);
    } catch (error) {
      logger.error('Failed to check IEP compliance', error as Error, { iepId });
    }
  }

  // Calculate aggregate stats
  const totalIEPs = results.length;
  const compliantIEPs = results.filter((r) => r.overallStatus === 'compliant').length;
  const nonCompliantIEPs = results.filter((r) => r.overallStatus === 'non-compliant').length;
  const needsReviewIEPs = results.filter((r) => r.overallStatus === 'needs-review').length;

  const avgComplianceScore =
    results.reduce((sum, r) => sum + r.complianceScore, 0) / totalIEPs;

  return {
    districtId,
    state,
    totalIEPs,
    compliantIEPs,
    nonCompliantIEPs,
    needsReviewIEPs,
    complianceRate: (compliantIEPs / totalIEPs) * 100,
    avgComplianceScore,
    results,
    generatedAt: new Date(),
  };
}

/**
 * HELPER FUNCTIONS
 */

async function fetchIEPData(iepId: string): Promise<any> {
  // In production: SELECT * FROM ieps WHERE id = $1
  return {
    id: iepId,
    studentAge: 17,
    hasTransitionPlan: true,
    hasMeasurableGoals: true,
    hasPLOP: true,
    hasProgressMeasurement: false,
    hasAccommodations: true,
  };
}

/**
 * Check federal IDEA compliance with detailed validation
 * Uses bulletproof validation logic from compliance-validation.ts
 */
async function checkFederalCompliance(iep: any): Promise<ComplianceIssue[]> {
  const issues: ComplianceIssue[] = [];

  // 1. Validate PLOP (34 CFR §300.320(a)(1))
  const plopValidation = validatePLOP(iep);
  if (!plopValidation.isValid) {
    issues.push({
      ruleId: 'PLOP',
      ruleName: 'Present Levels of Performance',
      severity: 'critical',
      description: 'IEP must include present levels of academic achievement and functional performance',
      citation: '34 CFR §300.320(a)(1)',
      finding: plopValidation.issues.join('; '),
      remediation:
        'Add comprehensive PLOP section including: (1) current academic performance with data, (2) functional performance, (3) how disability affects involvement in general education',
    });
  }

  // 2. Validate Measurable Goals (34 CFR §300.320(a)(2))
  const goalsValidation = validateMeasurableGoals(iep);
  if (!goalsValidation.isValid) {
    issues.push({
      ruleId: 'MEASURABLE_GOALS',
      ruleName: 'Measurable Annual Goals',
      severity: 'critical',
      description: 'Goals must be measurable and include academic and functional goals',
      citation: '34 CFR §300.320(a)(2)',
      finding: goalsValidation.issues.join('; '),
      remediation:
        'Rewrite goals to include: (1) observable behavior, (2) measurable criteria (e.g., "80% accuracy"), (3) conditions/context (e.g., "in 4 out of 5 trials")',
    });
  }

  // 3. Validate Progress Measurement (34 CFR §300.320(a)(3))
  const progressValidation = validateProgressMeasurement(iep);
  if (!progressValidation.isValid) {
    issues.push({
      ruleId: 'PROGRESS_MEASUREMENT',
      ruleName: 'Progress Measurement',
      severity: 'critical',
      description: 'Description of how progress will be measured and when reports will be provided',
      citation: '34 CFR §300.320(a)(3)',
      finding: progressValidation.issues.join('; '),
      remediation: 'Add section specifying how progress will be measured (e.g., weekly assessments) and reporting schedule (e.g., quarterly)',
    });
  }

  // 4. Validate Special Education Services (34 CFR §300.320(a)(4))
  if (!iep.services || !Array.isArray(iep.services) || iep.services.length === 0) {
    issues.push({
      ruleId: 'SPECIAL_ED_SERVICES',
      ruleName: 'Special Education Services',
      severity: 'critical',
      description: 'Statement of special education and related services to be provided',
      citation: '34 CFR §300.320(a)(4)',
      finding: 'No special education services specified',
      remediation: 'Add detailed services section including: (1) type of service, (2) frequency, (3) duration, (4) location, (5) start date',
    });
  } else {
    // Validate each service has required details
    const incompleteServices = iep.services.filter((service: any) =>
      !service.type || !service.frequency || !service.duration
    );
    if (incompleteServices.length > 0) {
      issues.push({
        ruleId: 'SPECIAL_ED_SERVICES',
        ruleName: 'Special Education Services',
        severity: 'warning',
        description: 'Services must include type, frequency, and duration',
        citation: '34 CFR §300.320(a)(4)',
        finding: `${incompleteServices.length} service(s) missing required details`,
        remediation: 'Each service must specify: type (e.g., "Speech Therapy"), frequency (e.g., "2x weekly"), duration (e.g., "30 minutes")',
      });
    }
  }

  // 5. Validate LRE Explanation (34 CFR §300.320(a)(5))
  if (!iep.lreJustification || typeof iep.lreJustification !== 'string') {
    issues.push({
      ruleId: 'LRE_EXPLANATION',
      ruleName: 'LRE Explanation',
      severity: 'warning',
      description: 'Explanation of extent student will not participate with nondisabled children',
      citation: '34 CFR §300.320(a)(5)',
      finding: 'LRE justification is missing',
      remediation: 'Add LRE explanation describing: (1) extent of participation in general education, (2) justification for any removal from general education, (3) consideration of supplementary aids and services',
    });
  } else if (iep.lreJustification.trim().length < 30) {
    issues.push({
      ruleId: 'LRE_EXPLANATION',
      ruleName: 'LRE Explanation',
      severity: 'warning',
      description: 'LRE justification is too brief',
      citation: '34 CFR §300.320(a)(5)',
      finding: 'LRE justification lacks substantive explanation',
      remediation: 'Expand LRE justification to include substantive explanation of placement decision',
    });
  }

  // 6. Validate Accommodations (34 CFR §300.320(a)(6))
  if (!iep.accommodations || !Array.isArray(iep.accommodations) || iep.accommodations.length === 0) {
    issues.push({
      ruleId: 'ACCOMMODATIONS',
      ruleName: 'Accommodations',
      severity: 'warning',
      description: 'Individual accommodations necessary to measure academic achievement',
      citation: '34 CFR §300.320(a)(6)',
      finding: 'No accommodations specified',
      remediation: 'Add accommodations for: (1) classroom instruction, (2) assessments, (3) state/district testing. Examples: extended time, breaks, small group setting',
    });
  }

  // 7. Validate Transition Services (34 CFR §300.320(b)) - Age 16+
  const transitionValidation = validateTransitionServices(iep);
  if (!transitionValidation.isValid) {
    issues.push({
      ruleId: 'TRANSITION_SERVICES',
      ruleName: 'Transition Services (Age 16+)',
      severity: 'critical',
      description: 'Transition services and postsecondary goals required for students 16 and older',
      citation: '34 CFR §300.320(b)',
      finding: transitionValidation.issues.join('; '),
      remediation: 'Add transition plan including: (1) measurable postsecondary goals (education, employment, independent living), (2) transition services to help achieve goals, (3) agency linkages',
    });
  }

  return issues;
}

/**
 * Check state-specific compliance requirements
 * Validates against state regulations in addition to federal IDEA
 */
async function checkStateCompliance(iep: any, state: string): Promise<ComplianceIssue[]> {
  const issues: ComplianceIssue[] = [];

  // Get state requirements (returns empty array if state not in our database yet)
  const stateReqs = STATE_REQUIREMENTS[state] || [];

  if (stateReqs.length === 0) {
    logger.warn('No state-specific requirements configured', { state });
    // This is OK - just means we only check federal compliance for this state
    return issues;
  }

  // California-specific checks
  if (state === 'CA') {
    // CA triennial assessment requirement
    if (iep.lastAssessmentDate) {
      const daysSinceAssessment = Math.floor(
        (Date.now() - new Date(iep.lastAssessmentDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceAssessment > 1095) { // 3 years = 1095 days
        issues.push({
          ruleId: 'CA_TRIENNIAL',
          ruleName: 'Triennial Assessment',
          severity: 'critical',
          description: 'California requires reassessment at least once every 3 years',
          citation: 'Cal. Ed. Code §56381',
          finding: `Last assessment was ${Math.floor(daysSinceAssessment / 365)} years ago`,
          remediation: 'Schedule triennial reassessment immediately',
        });
      }
    }

    // CA disability category requirement
    if (!iep.disabilityCategory) {
      issues.push({
        ruleId: 'CA_DIS_CATEGORY',
        ruleName: 'Disability Category',
        severity: 'warning',
        description: 'Must specify primary disability category from California list',
        citation: 'Cal. Ed. Code §56026',
        finding: 'Disability category not specified',
        remediation: 'Specify primary disability category',
      });
    }
  }

  // Texas-specific checks
  if (state === 'TX') {
    // TX ARD committee requirement
    if (!iep.ardCommitteeMembers || iep.ardCommitteeMembers.length < 5) {
      issues.push({
        ruleId: 'TX_ARD_COMMITTEE',
        ruleName: 'ARD Committee',
        severity: 'critical',
        description: 'Texas ARD committee must include all required members',
        citation: '19 TAC §89.1050',
        finding: 'ARD committee composition incomplete',
        remediation: 'Ensure ARD includes: parent, LEA rep, general ed teacher, special ed teacher, evaluation interpreter, student (if appropriate)',
      });
    }

    // TX behavior plan if behavior impedes learning
    if (iep.behaviorImpedesLearning && !iep.hasBehaviorPlan) {
      issues.push({
        ruleId: 'TX_BEHAVIOR_PLAN',
        ruleName: 'Behavior Intervention Plan',
        severity: 'warning',
        description: 'Required if behavior impedes learning',
        citation: '19 TAC §89.1053',
        finding: 'Behavior impedes learning but no BIP present',
        remediation: 'Develop Behavior Intervention Plan (BIP)',
      });
    }
  }

  // New York-specific checks
  if (state === 'NY') {
    // NY annual review requirement
    if (iep.lastReviewDate) {
      const daysSinceReview = Math.floor(
        (Date.now() - new Date(iep.lastReviewDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceReview > 365) {
        issues.push({
          ruleId: 'NY_ANNUAL_REVIEW',
          ruleName: 'Annual Review',
          severity: 'critical',
          description: 'New York requires annual review and parent notification',
          citation: '8 NYCRR §200.4(b)',
          finding: `IEP has not been reviewed in ${Math.floor(daysSinceReview / 365)} year(s)`,
          remediation: 'Schedule annual IEP review meeting immediately',
        });
      }
    }

    // NY 12-month services consideration
    if (!iep.consideredExtendedYear) {
      issues.push({
        ruleId: 'NY_12_MONTH',
        ruleName: '12-Month Services',
        severity: 'warning',
        description: 'Must consider need for 12-month school year services',
        citation: '8 NYCRR §200.6(k)',
        finding: 'No documentation of extended year consideration',
        remediation: 'Document team consideration of need for 12-month services',
      });
    }
  }

  logger.info('State compliance check completed', { state, issueCount: issues.length });
  return issues;
}

async function storeComplianceResult(result: ComplianceResult): Promise<void> {
  // In production: INSERT INTO compliance_reports (...)
  logger.info('Storing compliance result', { iepId: result.iepId });
}

async function generatePDFReport(data: any): Promise<string> {
  // In production: Call PDF service to generate report
  return `https://pathwise.edu/reports/${data.iepId}-compliance.pdf`;
}

async function generateAIRemediationPlan(result: ComplianceResult): Promise<any> {
  const prompt = `You are a special education compliance expert. Review this IEP compliance report and generate a detailed remediation plan.

Compliance Issues:
${result.issues.map((issue) => `- ${issue.ruleName}: ${issue.finding}`).join('\n')}

Generate a step-by-step remediation plan with:
1. Immediate actions (critical issues)
2. Short-term actions (warnings)
3. Specific language to add to IEP
4. Timeline for remediation

Format as JSON.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  const content = response.choices[0].message.content || '{}';

  try {
    return JSON.parse(content);
  } catch {
    return { plan: content };
  }
}

function generateExecutiveSummary(result: ComplianceResult): string {
  return `This IEP has a compliance score of ${result.complianceScore}/100 with ${result.criticalIssueCount} critical issues and ${result.warningCount} warnings. Status: ${result.overallStatus.toUpperCase()}.`;
}

function prioritizeActions(issues: ComplianceIssue[]): any[] {
  return issues
    .sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .map((issue, idx) => ({
      priority: idx + 1,
      action: issue.remediation,
      severity: issue.severity,
      rule: issue.ruleName,
    }));
}

function calculateRemediationTime(issues: ComplianceIssue[]): string {
  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  const hours = criticalCount * 2 + warningCount * 0.5;

  if (hours < 2) return 'Less than 2 hours';
  if (hours < 8) return `${Math.ceil(hours)} hours`;
  return `${Math.ceil(hours / 8)} days`;
}

async function fetchActiveIEPIds(districtId: string): Promise<string[]> {
  // In production: SELECT id FROM ieps WHERE district_id = $1 AND status = 'active'
  return ['iep-1', 'iep-2', 'iep-3'];
}
