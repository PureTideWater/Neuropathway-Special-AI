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
 */
export async function checkIEPCompliance(
  iepId: string,
  state: string,
  generatePDF: boolean = false
): Promise<ComplianceResult> {
  logger.info('Checking IEP compliance', { iepId, state });

  // In production: Fetch IEP from database
  const iep = await fetchIEPData(iepId);

  // Check federal requirements
  const federalIssues = await checkFederalCompliance(iep);

  // Check state-specific requirements
  const stateIssues = await checkStateCompliance(iep, state);

  // Combine issues
  const allIssues = [...federalIssues, ...stateIssues];

  // Calculate compliance score
  const criticalIssueCount = allIssues.filter((i) => i.severity === 'critical').length;
  const warningCount = allIssues.filter((i) => i.severity === 'warning').length;

  const complianceScore = Math.max(
    0,
    100 - criticalIssueCount * 15 - warningCount * 5
  );

  const overallStatus: 'compliant' | 'non-compliant' | 'needs-review' =
    criticalIssueCount === 0
      ? warningCount === 0
        ? 'compliant'
        : 'needs-review'
      : 'non-compliant';

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

  // Store result in database
  await storeComplianceResult(result);

  // Generate PDF if requested
  if (generatePDF) {
    const pdfUrl = await generatePDFReport(result);
    result.pdfUrl = pdfUrl;
  }

  logger.info('Compliance check complete', {
    iepId,
    overallStatus,
    complianceScore,
    criticalIssues: criticalIssueCount,
  });

  return result;
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

async function checkFederalCompliance(iep: any): Promise<ComplianceIssue[]> {
  const issues: ComplianceIssue[] = [];

  // Check PLOP
  if (!iep.hasPLOP) {
    issues.push({
      ruleId: 'PLOP',
      ruleName: 'Present Levels of Performance',
      severity: 'critical',
      description: 'IEP must include present levels of academic achievement and functional performance',
      citation: '34 CFR §300.320(a)(1)',
      finding: 'No PLOP section found in IEP',
      remediation: 'Add detailed PLOP section describing current academic and functional performance',
    });
  }

  // Check measurable goals
  if (!iep.hasMeasurableGoals) {
    issues.push({
      ruleId: 'MEASURABLE_GOALS',
      ruleName: 'Measurable Annual Goals',
      severity: 'critical',
      description: 'Goals must be measurable and include academic and functional goals',
      citation: '34 CFR §300.320(a)(2)',
      finding: 'Goals are not measurable or missing',
      remediation: 'Rewrite goals to include specific, measurable criteria (e.g., "80% accuracy on 4 out of 5 trials")',
    });
  }

  // Check progress measurement
  if (!iep.hasProgressMeasurement) {
    issues.push({
      ruleId: 'PROGRESS_MEASUREMENT',
      ruleName: 'Progress Measurement',
      severity: 'critical',
      description: 'Description of how progress will be measured and when reports will be provided',
      citation: '34 CFR §300.320(a)(3)',
      finding: 'No progress measurement methodology specified',
      remediation: 'Add section specifying how progress will be measured (e.g., weekly assessments) and reporting schedule (e.g., quarterly)',
    });
  }

  // Check transition services for students 16+
  if (iep.studentAge >= 16 && !iep.hasTransitionPlan) {
    issues.push({
      ruleId: 'TRANSITION_SERVICES',
      ruleName: 'Transition Services (Age 16+)',
      severity: 'critical',
      description: 'Transition services and postsecondary goals required for students 16 and older',
      citation: '34 CFR §300.320(b)',
      finding: 'Student is 16+ but no transition plan found',
      remediation: 'Add transition plan with postsecondary goals, transition services, and agency linkages',
    });
  }

  return issues;
}

async function checkStateCompliance(iep: any, state: string): Promise<ComplianceIssue[]> {
  const issues: ComplianceIssue[] = [];

  const stateReqs = STATE_REQUIREMENTS[state] || [];

  // State-specific checks would go here
  // For demo, return empty array
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
