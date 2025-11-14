/**
 * Natural Language to IEP Goal Conversion API
 * Patent-worthy feature: Converts observations to IDEA-compliant goals
 *
 * This is a MOCK with realistic data - will connect to AI Engine later
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://ai-engine:4004';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      observation,
      studentGrade,
      disabilityCategory,
      priorityArea,
      currentPerformanceLevel,
    } = body;

    if (!observation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Observation text is required',
        },
        { status: 400 }
      );
    }

    // MOCK: Generate three goal alternatives
    // In production, this would call: ${AI_ENGINE_URL}/api/goals/nl-convert
    const mockData = generateMockGoals(
      observation,
      studentGrade,
      disabilityCategory,
      priorityArea,
      currentPerformanceLevel
    );

    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'Goals generated successfully',
    });
  } catch (error) {
    console.error('Error converting observation to goal:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate goals',
      },
      { status: 500 }
    );
  }
}

/**
 * Mock goal generation - produces realistic IDEA-compliant goals
 */
function generateMockGoals(
  observation: string,
  grade: number = 3,
  disability: string = 'SLD',
  area: string = 'reading',
  currentLevel: string = ''
) {
  const skillArea = area.toLowerCase();
  const studentGrade = grade;

  // Determine baseline from current level or observation
  const baseline = currentLevel || extractBaseline(observation);

  // Generate three variants: conservative, standard, ambitious
  const conservative = generateGoalVariant(
    'conservative',
    skillArea,
    studentGrade,
    baseline
  );
  const standard = generateGoalVariant('standard', skillArea, studentGrade, baseline);
  const ambitious = generateGoalVariant('ambitious', skillArea, studentGrade, baseline);

  return {
    primary: standard,
    alternatives: [conservative, ambitious],
    metadata: {
      observation,
      studentGrade,
      disabilityCategory: disability,
      priorityArea: skillArea,
      generatedAt: new Date().toISOString(),
    },
  };
}

function generateGoalVariant(
  variant: 'conservative' | 'standard' | 'ambitious',
  skillArea: string,
  grade: number,
  baseline: string
) {
  const criteriaMap = {
    conservative: { accuracy: 70, trials: '3 out of 4' },
    standard: { accuracy: 80, trials: '4 out of 5' },
    ambitious: { accuracy: 90, trials: '9 out of 10' },
  };

  const criteria = criteriaMap[variant];

  // Skill-specific goal templates
  const templates: any = {
    reading: {
      condition: `Given a ${getGradeLevel(grade)} reading passage`,
      behavior: 'demonstrate comprehension by answering literal and inferential questions',
      measurement: `with ${criteria.accuracy}% accuracy across ${criteria.trials} trials`,
      timeline: 'as measured by weekly reading assessments',
      baseline: baseline || `Currently reading at ${Math.max(1, grade - 2)} grade level`,
      targetCriteria: `${criteria.accuracy}% accuracy (${criteria.trials} trials)`,
      measurementMethod: 'Weekly reading comprehension assessments with documented results',
    },
    math: {
      condition: `When presented with ${getGradeLevel(grade)} math problems`,
      behavior: 'solve problems independently',
      measurement: `with ${criteria.accuracy}% accuracy across ${criteria.trials} trials`,
      timeline: 'as measured by weekly math assessments',
      baseline: baseline || `Currently at ${Math.max(1, grade - 1)} grade level in math`,
      targetCriteria: `${criteria.accuracy}% accuracy (${criteria.trials} trials)`,
      measurementMethod: 'Weekly math assessments with error analysis',
    },
    writing: {
      condition: `Given a ${getGradeLevel(grade)} writing prompt`,
      behavior: 'compose a paragraph with topic sentence, supporting details, and conclusion',
      measurement: `meeting ${criteria.accuracy}% of rubric criteria in ${criteria.trials} attempts`,
      timeline: 'as measured by weekly writing samples',
      baseline: baseline || `Currently writes simple sentences with minimal detail`,
      targetCriteria: `${criteria.accuracy}% of rubric criteria (${criteria.trials} samples)`,
      measurementMethod: 'Grade-level writing rubric with teacher scoring',
    },
    behavior: {
      condition: 'During structured classroom activities',
      behavior: 'remain on-task and follow classroom expectations',
      measurement: `for ${criteria.accuracy}% of observed intervals in ${criteria.trials} sessions`,
      timeline: 'as measured by behavioral observation sheets',
      baseline: baseline || `Currently on-task approximately 50% of the time`,
      targetCriteria: `${criteria.accuracy}% on-task (${criteria.trials} sessions)`,
      measurementMethod: 'Interval recording with 5-minute observation periods',
    },
    social: {
      condition: 'During peer interactions and group activities',
      behavior: 'demonstrate appropriate social skills including turn-taking and active listening',
      measurement: `in ${criteria.accuracy}% of observed interactions across ${criteria.trials} sessions`,
      timeline: 'as measured by social skills observation checklist',
      baseline: baseline || `Currently demonstrates social skills inconsistently`,
      targetCriteria: `${criteria.accuracy}% appropriate interactions (${criteria.trials} sessions)`,
      measurementMethod: 'Social skills checklist with documented observations',
    },
  };

  const template = templates[skillArea] || templates.reading;

  const fullGoal = `${template.condition}, [Student] will ${template.behavior} ${template.measurement} ${template.timeline}.`;

  return {
    goal: fullGoal,
    goalType: skillArea === 'behavior' || skillArea === 'social' ? 'functional' : 'academic',
    condition: template.condition,
    observableBehavior: template.behavior,
    measurableCriteria: template.measurement,
    timeline: template.timeline,
    baseline: template.baseline,
    targetCriteria: template.targetCriteria,
    measurementMethod: template.measurementMethod,
    isCompliant: true,
    complianceScore: variant === 'standard' ? 96 : variant === 'conservative' ? 92 : 89,
    validationIssues: [],
    validationWarnings:
      variant === 'ambitious'
        ? ['Goal may be challenging - ensure adequate supports are in place']
        : [],
    confidence: variant === 'standard' ? 0.95 : variant === 'conservative' ? 0.92 : 0.88,
  };
}

function getGradeLevel(grade: number): string {
  if (grade === 0) return 'kindergarten';
  if (grade === 1) return '1st grade';
  if (grade === 2) return '2nd grade';
  if (grade === 3) return '3rd grade';
  return `${grade}th grade`;
}

function extractBaseline(observation: string): string {
  // Simple baseline extraction from observation text
  const lower = observation.toLowerCase();

  if (lower.includes('struggle') || lower.includes('difficulty')) {
    return 'Currently performing below grade level expectations';
  }
  if (lower.includes('sometimes') || lower.includes('inconsistent')) {
    return 'Currently demonstrates skill inconsistently (approximately 50% accuracy)';
  }
  if (lower.includes('rarely') || lower.includes('unable')) {
    return 'Currently performs skill with significant support only';
  }

  return 'Baseline to be determined through formal assessment';
}
