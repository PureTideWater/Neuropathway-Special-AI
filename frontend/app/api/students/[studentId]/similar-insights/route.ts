/**
 * Similar Student Insights API
 * Patent-worthy feature: Network effect recommendations
 *
 * This is a MOCK with realistic data - will connect to AI Engine later
 */

import { NextRequest, NextResponse } from 'next/server';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://ai-engine:4004';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const studentId = params.studentId;

    // MOCK: Generate similar student insights
    // In production, this would call: ${AI_ENGINE_URL}/api/insights/similar-students/${studentId}
    const mockData = generateMockInsights(studentId);

    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'Similar student insights generated successfully',
    });
  } catch (error) {
    console.error('Error fetching similar student insights:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch similar student insights',
      },
      { status: 500 }
    );
  }
}

/**
 * Mock insights generation - produces realistic network effect data
 */
function generateMockInsights(studentId: string) {
  // Mock target student profile
  const targetStudent = {
    studentId,
    firstName: 'Emma',
    lastName: 'Williams',
    grade: 3,
    primaryDisability: 'Specific Learning Disability (Reading)',
    readingLevel: 2.1,
    mathLevel: 3.3,
    accommodations: ['Extended time', 'Small group instruction', 'Audiobooks'],
    services: ['Reading support', 'Speech therapy'],
  };

  // Mock similar students (anonymized)
  const similarStudents = [
    {
      studentId: 'anon-001',
      anonymizedId: 'Student #12847',
      similarityScore: 0.94,
      matchingFactors: [
        'Same primary disability',
        'Similar reading level',
        'Extended time accommodation',
      ],
      outcomes: {
        goalSuccessRate: 87,
        averageProgress: 78,
        timeToGoalAchievement: 8,
      },
    },
    {
      studentId: 'anon-002',
      anonymizedId: 'Student #09234',
      similarityScore: 0.92,
      matchingFactors: [
        'Same grade level',
        'Similar reading/math profile',
        'Small group instruction',
      ],
      outcomes: {
        goalSuccessRate: 92,
        averageProgress: 85,
        timeToGoalAchievement: 6,
      },
    },
    {
      studentId: 'anon-003',
      anonymizedId: 'Student #15632',
      similarityScore: 0.89,
      matchingFactors: [
        'Same disability category',
        'Similar service needs',
        'Comparable baseline',
      ],
      outcomes: {
        goalSuccessRate: 85,
        averageProgress: 75,
        timeToGoalAchievement: 9,
      },
    },
    {
      studentId: 'anon-004',
      anonymizedId: 'Student #07891',
      similarityScore: 0.87,
      matchingFactors: ['Same grade', 'Reading deficit', 'Extended time'],
      outcomes: {
        goalSuccessRate: 89,
        averageProgress: 82,
        timeToGoalAchievement: 7,
      },
    },
    {
      studentId: 'anon-005',
      anonymizedId: 'Student #11456',
      similarityScore: 0.85,
      matchingFactors: ['Similar profile', 'Speech services', 'Reading support'],
      outcomes: {
        goalSuccessRate: 91,
        averageProgress: 80,
        timeToGoalAchievement: 8,
      },
    },
    {
      studentId: 'anon-006',
      anonymizedId: 'Student #03214',
      similarityScore: 0.83,
      matchingFactors: ['Grade 3', 'SLD Reading', 'Small group'],
      outcomes: {
        goalSuccessRate: 84,
        averageProgress: 73,
        timeToGoalAchievement: 10,
      },
    },
    {
      studentId: 'anon-007',
      anonymizedId: 'Student #19087',
      similarityScore: 0.81,
      matchingFactors: ['Similar accommodations', 'Reading level', 'Disability match'],
      outcomes: {
        goalSuccessRate: 88,
        averageProgress: 79,
        timeToGoalAchievement: 7,
      },
    },
    {
      studentId: 'anon-008',
      anonymizedId: 'Student #06543',
      similarityScore: 0.79,
      matchingFactors: ['Same services', 'Grade match', 'Reading focus'],
      outcomes: {
        goalSuccessRate: 86,
        averageProgress: 77,
        timeToGoalAchievement: 9,
      },
    },
    {
      studentId: 'anon-009',
      anonymizedId: 'Student #14829',
      similarityScore: 0.77,
      matchingFactors: ['SLD category', 'Extended time', 'Reading support'],
      outcomes: {
        goalSuccessRate: 90,
        averageProgress: 81,
        timeToGoalAchievement: 8,
      },
    },
  ];

  // Mock evidence-based recommendations
  const recommendations = [
    {
      type: 'accommodation',
      name: 'Extended Time on Reading Assessments (1.5x)',
      description:
        'Provide 1.5x standard time on all reading comprehension assessments and assignments',
      evidenceStrength: 'strong',
      successRate: 85,
      sampleSize: 1247,
      expectedImpact: '+15-20% on reading comprehension scores',
      implementationGuidance:
        'Start with 1.5x time on all reading tasks. Monitor progress weekly. Adjust to 2x if student consistently uses full extended time without completion. Document time usage in progress notes.',
    },
    {
      type: 'intervention',
      name: 'Daily Small Group Reading Instruction (15 min)',
      description:
        'Structured phonics and comprehension practice in groups of 3-4 students',
      evidenceStrength: 'strong',
      successRate: 82,
      sampleSize: 892,
      expectedImpact: '+1.2 grade levels improvement in 6 months',
      implementationGuidance:
        'Use research-based reading programs (e.g., Orton-Gillingham, Wilson Reading). Focus on decoding, fluency, and comprehension strategies. Track progress with weekly running records.',
    },
    {
      type: 'accommodation',
      name: 'Audiobook Access for Grade-Level Content',
      description: 'Provide audiobook versions of all required reading materials',
      evidenceStrength: 'strong',
      successRate: 78,
      sampleSize: 1089,
      expectedImpact: '+25% content comprehension',
      implementationGuidance:
        'Use Learning Ally, Bookshare, or district audiobook library. Teach student to follow along with text while listening. Combine with graphic organizers for key concepts.',
    },
    {
      type: 'goal_strategy',
      name: 'Chunked Reading Passages with Comprehension Checks',
      description: 'Break reading assignments into smaller sections with frequent checks',
      evidenceStrength: 'moderate',
      successRate: 73,
      sampleSize: 654,
      expectedImpact: '+10-15% reading stamina',
      implementationGuidance:
        'Divide passages into 2-3 paragraph chunks. After each chunk, student answers 1-2 comprehension questions. This builds stamina gradually while maintaining comprehension.',
    },
    {
      type: 'intervention',
      name: 'Weekly One-on-One Reading Conference (10 min)',
      description: 'Individual reading conference with teacher to discuss books and strategies',
      evidenceStrength: 'moderate',
      successRate: 76,
      sampleSize: 423,
      expectedImpact: '+20% reading engagement',
      implementationGuidance:
        'Schedule consistent 10-minute weekly conferences. Student brings current book. Discuss comprehension, vocabulary, and reading strategies. Set weekly reading goals together.',
    },
  ];

  // Mock benchmarks
  const benchmarks = [
    {
      metric: 'Reading Goal Success Rate',
      studentValue: 78,
      similarStudentsAverage: 87,
      districtAverage: 75,
      nationalAverage: 72,
      trend: 'at' as const,
      interpretation: 'Student is performing at district average but below similar students',
    },
    {
      metric: 'Average Progress Rate',
      studentValue: 65,
      similarStudentsAverage: 79,
      districtAverage: 70,
      nationalAverage: 68,
      trend: 'below' as const,
      interpretation: 'Progress rate is slower than similar students - consider intensifying interventions',
    },
    {
      metric: 'Accommodation Usage Effectiveness',
      studentValue: 82,
      similarStudentsAverage: 80,
      districtAverage: 75,
      nationalAverage: 73,
      trend: 'above' as const,
      interpretation: 'Accommodations are being used effectively',
    },
    {
      metric: 'Time to Goal Achievement',
      studentValue: 85,
      similarStudentsAverage: 82,
      districtAverage: 78,
      nationalAverage: 75,
      trend: 'above' as const,
      interpretation: 'Student reaches goals slightly faster than peers (higher is better)',
    },
  ];

  return {
    targetStudent,
    similarStudents,
    recommendations,
    benchmarks,
    networkSize: 127459, // Total students in network
    metadata: {
      generatedAt: new Date().toISOString(),
      dataFreshness: 'Updated daily',
      minSimilarityThreshold: 0.70,
      totalComparisons: 127459,
    },
  };
}
