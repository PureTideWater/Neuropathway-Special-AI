/**
 * Similar Student Insights Service
 *
 * NETWORK EFFECT MOAT 🏆
 * "The Netflix of Special Education" - Collaborative filtering for IEPs
 *
 * PATENT-WORTHY INNOVATION:
 * "Method for recommending educational interventions using collaborative
 * filtering of student profile similarity and historical outcome data"
 *
 * COMPETITIVE ADVANTAGE:
 * - Only possible with large, diverse dataset (data moat)
 * - Accuracy improves with every district added (network effect)
 * - First-mover advantage (largest dataset wins)
 * - Creates switching costs (lose access to insights if they leave)
 *
 * REVENUE IMPACT:
 * - Enterprise tier feature ($50K-150K/district/year)
 * - Network effect multiplier (2x value with 10x data)
 * - Viral growth (districts want access to larger network)
 *
 * HOW IT WORKS:
 * 1. Encode student profile as feature vector (disability, grade, demographics, etc.)
 * 2. Find "similar" students using cosine similarity
 * 3. Analyze what worked for similar students (accommodations, interventions, etc.)
 * 4. Recommend proven strategies from similar cases
 * 5. Track effectiveness to continuously improve recommendations
 */

import { logger } from '../utils/logger';

/**
 * Student profile for similarity matching
 * This is the "fingerprint" we use to find similar students
 */
export interface StudentProfile {
  // Identifiers (anonymized for privacy)
  anonymousId: string; // Hashed student ID
  districtId: string; // For opt-in/opt-out

  // Demographics
  gradeLevel: number; // K=0, 1st=1, ..., 12th=12
  age: number;
  gender?: 'M' | 'F' | 'other' | 'undisclosed';

  // Disability information
  primaryDisability: string; // SLD, ASD, ID, ED, etc.
  secondaryDisabilities?: string[];
  disabilitySeverity?: 'mild' | 'moderate' | 'severe';

  // Academic profile
  readingLevel: number; // Grade-level equivalent
  mathLevel: number; // Grade-level equivalent
  overallGPA?: number; // 0-4.0 scale

  // Support profile
  servicesReceived: string[]; // ['Resource Room', 'Speech Therapy', etc.]
  accommodationsUsed: string[]; // ['Extended Time', 'Small Group', etc.]
  interventionsActive: string[];

  // Environmental factors
  attendanceRate: number; // 0-1
  behaviorIncidents?: number; // Per month
  parentEngagementLevel: 'low' | 'medium' | 'high';

  // Contextual
  englishLanguageLearner: boolean;
  freeReducedLunch: boolean; // Socioeconomic proxy
  urbanRuralSuburban?: 'urban' | 'rural' | 'suburban';
}

/**
 * Outcome data for a student
 * What actually happened - used to recommend to similar students
 */
export interface StudentOutcomes {
  anonymousId: string;

  // Goal achievement
  goalsAttempted: number;
  goalsMet: number;
  goalsExceeded: number;
  avgGoalProgress: number; // 0-100%

  // Academic progress
  readingGrowth: number; // Grade levels gained per year
  mathGrowth: number;

  // Behavior
  behaviorImprovement?: number; // Percentage reduction in incidents

  // Intervention effectiveness
  effectiveInterventions: Array<{
    intervention: string;
    measuredImpact: number; // % improvement
    confidenceLevel: number; // How sure we are this worked
  }>;

  effectiveAccommodations: Array<{
    accommodation: string;
    usageRate: number; // How often used
    correlatedWithSuccess: boolean;
  }>;

  // Transition outcomes (if applicable)
  postSchoolOutcome?: 'employed' | 'college' | 'training' | 'supported_living' | 'unknown';

  // Timeline
  yearsInProgram: number;
  lastUpdated: Date;
}

/**
 * Similarity match result
 */
export interface SimilarStudent {
  anonymousId: string;
  similarityScore: number; // 0-1 (1 = identical)
  matchedFactors: string[]; // What made them similar

  profile: StudentProfile;
  outcomes: StudentOutcomes;

  keyTakeaways: string[]; // What can we learn from this student?
}

/**
 * Recommendation based on similar students
 */
export interface SimilarityBasedRecommendation {
  recommendationType: 'accommodation' | 'intervention' | 'service' | 'goal_strategy';
  recommendation: string;

  evidenceStrength: 'strong' | 'moderate' | 'weak';

  similarStudentCount: number; // How many similar students showed this worked
  successRate: number; // What % of similar students succeeded with this
  averageImpact: number; // Average improvement (%)

  examples: Array<{
    anonymousId: string;
    similarity: number;
    outcome: string;
    impact: number;
  }>;

  confidence: number; // 0-100% confidence in recommendation
}

/**
 * Complete insights package for a student
 */
export interface SimilarStudentInsights {
  targetStudentId: string;
  generatedAt: Date;

  similarStudentsFound: number;
  avgSimilarityScore: number;

  topMatches: SimilarStudent[]; // Top 10 most similar

  recommendations: {
    accommodations: SimilarityBasedRecommendation[];
    interventions: SimilarityBasedRecommendation[];
    goalStrategies: SimilarityBasedRecommendation[];
  };

  benchmarks: {
    avgGoalSuccessRate: number; // Similar students' success rate
    avgReadingGrowth: number;
    avgMathGrowth: number;
    avgAttendance: number;
  };

  successStories: Array<{
    anonymousId: string;
    similarity: number;
    story: string; // What worked for them
    keyFactors: string[];
  }>;

  // Network effect metrics
  datasetSize: number; // Total students in similarity database
  dataQuality: 'excellent' | 'good' | 'fair' | 'limited';
}

/**
 * CORE SIMILARITY MATCHING ALGORITHM
 * This is the "secret sauce" - how we find similar students
 */
export async function findSimilarStudents(
  targetProfile: StudentProfile,
  limit: number = 100,
  minSimilarity: number = 0.7
): Promise<SimilarStudent[]> {
  logger.info('Finding similar students', {
    targetStudent: targetProfile.anonymousId,
    limit,
    minSimilarity,
  });

  // STEP 1: Fetch all student profiles from database
  // In production: Query optimized similarity index
  const allProfiles = await fetchStudentProfiles();

  // STEP 2: Calculate similarity score for each student
  const similarities: Array<{ profile: StudentProfile; score: number }> = [];

  for (const profile of allProfiles) {
    // Don't match with self
    if (profile.anonymousId === targetProfile.anonymousId) continue;

    // Calculate similarity
    const score = calculateSimilarityScore(targetProfile, profile);

    if (score >= minSimilarity) {
      similarities.push({ profile, score });
    }
  }

  // STEP 3: Sort by similarity (highest first)
  similarities.sort((a, b) => b.score - a.score);

  // STEP 4: Take top matches
  const topMatches = similarities.slice(0, limit);

  // STEP 5: Enrich with outcomes data
  const similarStudents: SimilarStudent[] = [];

  for (const match of topMatches) {
    const outcomes = await fetchStudentOutcomes(match.profile.anonymousId);
    const matchedFactors = identifyMatchedFactors(targetProfile, match.profile);
    const keyTakeaways = generateKeyTakeaways(match.profile, outcomes);

    similarStudents.push({
      anonymousId: match.profile.anonymousId,
      similarityScore: match.score,
      matchedFactors,
      profile: match.profile,
      outcomes,
      keyTakeaways,
    });
  }

  logger.info('Similar students found', {
    targetStudent: targetProfile.anonymousId,
    foundCount: similarStudents.length,
    avgSimilarity: similarStudents.reduce((sum, s) => sum + s.similarityScore, 0) / similarStudents.length,
  });

  return similarStudents;
}

/**
 * Calculate similarity score between two students
 * Uses weighted feature matching with domain-specific weights
 */
function calculateSimilarityScore(
  student1: StudentProfile,
  student2: StudentProfile
): number {
  let totalWeight = 0;
  let weightedScore = 0;

  // Feature 1: Primary Disability (MOST IMPORTANT)
  const disabilityWeight = 10.0;
  if (student1.primaryDisability === student2.primaryDisability) {
    weightedScore += disabilityWeight * 1.0;
  } else if (isRelatedDisability(student1.primaryDisability, student2.primaryDisability)) {
    weightedScore += disabilityWeight * 0.5; // Partial match for related disabilities
  }
  totalWeight += disabilityWeight;

  // Feature 2: Grade Level
  const gradeWeight = 5.0;
  const gradeDiff = Math.abs(student1.gradeLevel - student2.gradeLevel);
  const gradeSimilarity = Math.max(0, 1 - gradeDiff / 5); // Within 5 grades = some similarity
  weightedScore += gradeWeight * gradeSimilarity;
  totalWeight += gradeWeight;

  // Feature 3: Reading Level
  const readingWeight = 4.0;
  const readingDiff = Math.abs(student1.readingLevel - student2.readingLevel);
  const readingSimilarity = Math.max(0, 1 - readingDiff / 3);
  weightedScore += readingWeight * readingSimilarity;
  totalWeight += readingWeight;

  // Feature 4: Math Level
  const mathWeight = 4.0;
  const mathDiff = Math.abs(student1.mathLevel - student2.mathLevel);
  const mathSimilarity = Math.max(0, 1 - mathDiff / 3);
  weightedScore += mathWeight * mathSimilarity;
  totalWeight += mathWeight;

  // Feature 5: Accommodations (Jaccard similarity)
  const accommodationWeight = 3.0;
  const accommodationSimilarity = jaccardSimilarity(
    student1.accommodationsUsed,
    student2.accommodationsUsed
  );
  weightedScore += accommodationWeight * accommodationSimilarity;
  totalWeight += accommodationWeight;

  // Feature 6: Services (Jaccard similarity)
  const serviceWeight = 3.0;
  const serviceSimilarity = jaccardSimilarity(student1.servicesReceived, student2.servicesReceived);
  weightedScore += serviceWeight * serviceSimilarity;
  totalWeight += serviceWeight;

  // Feature 7: Attendance Rate
  const attendanceWeight = 2.0;
  const attendanceDiff = Math.abs(student1.attendanceRate - student2.attendanceRate);
  const attendanceSimilarity = Math.max(0, 1 - attendanceDiff * 2); // 0.5 diff = 0 similarity
  weightedScore += attendanceWeight * attendanceSimilarity;
  totalWeight += attendanceWeight;

  // Feature 8: Parent Engagement
  const parentWeight = 2.0;
  const parentLevels = { low: 0, medium: 1, high: 2 };
  const parentDiff = Math.abs(parentLevels[student1.parentEngagementLevel] - parentLevels[student2.parentEngagementLevel]);
  const parentSimilarity = Math.max(0, 1 - parentDiff / 2);
  weightedScore += parentWeight * parentSimilarity;
  totalWeight += parentWeight;

  // Feature 9: English Language Learner
  const ellWeight = 1.5;
  if (student1.englishLanguageLearner === student2.englishLanguageLearner) {
    weightedScore += ellWeight * 1.0;
  }
  totalWeight += ellWeight;

  // Feature 10: Socioeconomic Status
  const sesWeight = 1.0;
  if (student1.freeReducedLunch === student2.freeReducedLunch) {
    weightedScore += sesWeight * 1.0;
  }
  totalWeight += sesWeight;

  // Calculate final similarity score (0-1)
  const finalScore = weightedScore / totalWeight;

  return Number(finalScore.toFixed(3));
}

/**
 * Generate recommendations based on similar students
 * This is where we turn similarity into actionable insights
 */
export async function generateRecommendations(
  targetStudentId: string
): Promise<SimilarStudentInsights> {
  logger.info('Generating similar student insights', { targetStudentId });

  // STEP 1: Get target student profile
  const targetProfile = await fetchStudentProfile(targetStudentId);

  // STEP 2: Find similar students
  const similarStudents = await findSimilarStudents(targetProfile, 100, 0.7);

  if (similarStudents.length < 10) {
    logger.warn('Limited similar students found', {
      targetStudentId,
      foundCount: similarStudents.length,
    });
  }

  // STEP 3: Aggregate accommodation effectiveness
  const accommodationRecs = aggregateAccommodationRecommendations(similarStudents);

  // STEP 4: Aggregate intervention effectiveness
  const interventionRecs = aggregateInterventionRecommendations(similarStudents);

  // STEP 5: Extract goal strategies
  const goalStrategyRecs = extractGoalStrategies(similarStudents);

  // STEP 6: Calculate benchmarks
  const benchmarks = calculateBenchmarks(similarStudents);

  // STEP 7: Extract success stories
  const successStories = extractSuccessStories(similarStudents);

  // STEP 8: Assess dataset quality
  const dataQuality = assessDataQuality(similarStudents.length, benchmarks);

  const insights: SimilarStudentInsights = {
    targetStudentId,
    generatedAt: new Date(),
    similarStudentsFound: similarStudents.length,
    avgSimilarityScore:
      similarStudents.reduce((sum, s) => sum + s.similarityScore, 0) / similarStudents.length,
    topMatches: similarStudents.slice(0, 10),
    recommendations: {
      accommodations: accommodationRecs,
      interventions: interventionRecs,
      goalStrategies: goalStrategyRecs,
    },
    benchmarks,
    successStories,
    datasetSize: await getDatasetSize(),
    dataQuality,
  };

  logger.info('Insights generated successfully', {
    targetStudentId,
    similarCount: similarStudents.length,
    recommendationCount:
      accommodationRecs.length + interventionRecs.length + goalStrategyRecs.length,
  });

  return insights;
}

/**
 * HELPER FUNCTIONS
 */

function jaccardSimilarity(set1: string[], set2: string[]): number {
  if (set1.length === 0 && set2.length === 0) return 1.0;

  const intersection = set1.filter((item) => set2.includes(item)).length;
  const union = new Set([...set1, ...set2]).size;

  return union > 0 ? intersection / union : 0;
}

function isRelatedDisability(disability1: string, disability2: string): boolean {
  // Group related disabilities
  const learningDisabilities = ['Specific Learning Disability', 'SLD', 'Dyslexia', 'Dyscalculia'];
  const autismSpectrum = ['Autism', 'ASD', 'Asperger', 'PDD-NOS'];
  const intellectualDisabilities = ['Intellectual Disability', 'ID', 'Developmental Delay'];

  for (const group of [learningDisabilities, autismSpectrum, intellectualDisabilities]) {
    if (group.includes(disability1) && group.includes(disability2)) {
      return true;
    }
  }

  return false;
}

function identifyMatchedFactors(
  student1: StudentProfile,
  student2: StudentProfile
): string[] {
  const factors: string[] = [];

  if (student1.primaryDisability === student2.primaryDisability) {
    factors.push(`Same disability (${student1.primaryDisability})`);
  }
  if (Math.abs(student1.gradeLevel - student2.gradeLevel) <= 1) {
    factors.push('Similar grade level');
  }
  if (Math.abs(student1.readingLevel - student2.readingLevel) <= 1) {
    factors.push('Similar reading level');
  }
  if (jaccardSimilarity(student1.accommodationsUsed, student2.accommodationsUsed) > 0.5) {
    factors.push('Uses similar accommodations');
  }
  if (Math.abs(student1.attendanceRate - student2.attendanceRate) < 0.1) {
    factors.push('Similar attendance patterns');
  }

  return factors;
}

function generateKeyTakeaways(profile: StudentProfile, outcomes: StudentOutcomes): string[] {
  const takeaways: string[] = [];

  const successRate = outcomes.goalsMet / outcomes.goalsAttempted;
  if (successRate > 0.8) {
    takeaways.push(`High success rate (${(successRate * 100).toFixed(0)}% of goals met)`);
  }

  if (outcomes.effectiveInterventions.length > 0) {
    const topIntervention = outcomes.effectiveInterventions[0];
    takeaways.push(`${topIntervention.intervention} showed ${topIntervention.measuredImpact}% improvement`);
  }

  if (outcomes.readingGrowth > 1.0) {
    takeaways.push(`Strong reading growth (${outcomes.readingGrowth.toFixed(1)} grade levels/year)`);
  }

  return takeaways;
}

function aggregateAccommodationRecommendations(
  similarStudents: SimilarStudent[]
): SimilarityBasedRecommendation[] {
  // Group by accommodation, count successes
  const accommodationMap = new Map<string, { total: number; successful: number; impact: number[] }>();

  for (const student of similarStudents) {
    for (const acc of student.outcomes.effectiveAccommodations) {
      if (!accommodationMap.has(acc.accommodation)) {
        accommodationMap.set(acc.accommodation, { total: 0, successful: 0, impact: [] });
      }

      const stats = accommodationMap.get(acc.accommodation)!;
      stats.total++;
      if (acc.correlatedWithSuccess) {
        stats.successful++;
      }
    }
  }

  // Convert to recommendations
  const recommendations: SimilarityBasedRecommendation[] = [];

  for (const [accommodation, stats] of accommodationMap.entries()) {
    if (stats.total < 3) continue; // Need at least 3 examples

    const successRate = stats.successful / stats.total;
    const evidenceStrength = stats.total >= 10 ? 'strong' : stats.total >= 5 ? 'moderate' : 'weak';

    recommendations.push({
      recommendationType: 'accommodation',
      recommendation: accommodation,
      evidenceStrength,
      similarStudentCount: stats.total,
      successRate,
      averageImpact: 0, // Would calculate from impact data
      examples: [], // Would populate with examples
      confidence: successRate * (stats.total / 10) * 100, // More students = higher confidence
    });
  }

  // Sort by confidence
  recommendations.sort((a, b) => b.confidence - a.confidence);

  return recommendations.slice(0, 5); // Top 5
}

function aggregateInterventionRecommendations(
  similarStudents: SimilarStudent[]
): SimilarityBasedRecommendation[] {
  // Similar to accommodations, but for interventions
  const interventionMap = new Map<string, { count: number; avgImpact: number; impacts: number[] }>();

  for (const student of similarStudents) {
    for (const intervention of student.outcomes.effectiveInterventions) {
      if (!interventionMap.has(intervention.intervention)) {
        interventionMap.set(intervention.intervention, { count: 0, avgImpact: 0, impacts: [] });
      }

      const stats = interventionMap.get(intervention.intervention)!;
      stats.count++;
      stats.impacts.push(intervention.measuredImpact);
      stats.avgImpact = stats.impacts.reduce((sum, i) => sum + i, 0) / stats.impacts.length;
    }
  }

  const recommendations: SimilarityBasedRecommendation[] = [];

  for (const [intervention, stats] of interventionMap.entries()) {
    if (stats.count < 3) continue;

    recommendations.push({
      recommendationType: 'intervention',
      recommendation: intervention,
      evidenceStrength: stats.count >= 10 ? 'strong' : stats.count >= 5 ? 'moderate' : 'weak',
      similarStudentCount: stats.count,
      successRate: 1.0, // All were "effective" interventions
      averageImpact: stats.avgImpact,
      examples: [],
      confidence: Math.min(95, stats.count * 10 + stats.avgImpact * 0.5),
    });
  }

  recommendations.sort((a, b) => b.averageImpact - a.averageImpact);

  return recommendations.slice(0, 5);
}

function extractGoalStrategies(similarStudents: SimilarStudent[]): SimilarityBasedRecommendation[] {
  // Extract what goal-writing strategies worked for similar students
  // This would analyze goal structure, timelines, target criteria, etc.
  // For now, return mock data
  return [];
}

function calculateBenchmarks(similarStudents: SimilarStudent[]): {
  avgGoalSuccessRate: number;
  avgReadingGrowth: number;
  avgMathGrowth: number;
  avgAttendance: number;
} {
  const totalGoals = similarStudents.reduce((sum, s) => sum + s.outcomes.goalsAttempted, 0);
  const metGoals = similarStudents.reduce((sum, s) => sum + s.outcomes.goalsMet, 0);

  const avgReadingGrowth =
    similarStudents.reduce((sum, s) => sum + s.outcomes.readingGrowth, 0) / similarStudents.length;

  const avgMathGrowth =
    similarStudents.reduce((sum, s) => sum + s.outcomes.mathGrowth, 0) / similarStudents.length;

  const avgAttendance =
    similarStudents.reduce((sum, s) => sum + s.profile.attendanceRate, 0) / similarStudents.length;

  return {
    avgGoalSuccessRate: totalGoals > 0 ? metGoals / totalGoals : 0,
    avgReadingGrowth,
    avgMathGrowth,
    avgAttendance,
  };
}

function extractSuccessStories(similarStudents: SimilarStudent[]): Array<any> {
  // Find top performers among similar students
  return similarStudents
    .filter((s) => s.outcomes.goalsMet / s.outcomes.goalsAttempted > 0.8)
    .slice(0, 3)
    .map((s) => ({
      anonymousId: s.anonymousId,
      similarity: s.similarityScore,
      story: `This student met ${s.outcomes.goalsMet} of ${s.outcomes.goalsAttempted} goals`,
      keyFactors: s.matchedFactors,
    }));
}

function assessDataQuality(
  similarStudentCount: number,
  benchmarks: any
): 'excellent' | 'good' | 'fair' | 'limited' {
  if (similarStudentCount >= 50) return 'excellent';
  if (similarStudentCount >= 20) return 'good';
  if (similarStudentCount >= 10) return 'fair';
  return 'limited';
}

// Mock database functions (would be real in production)
async function fetchStudentProfiles(): Promise<StudentProfile[]> {
  return []; // Would query database
}

async function fetchStudentProfile(studentId: string): Promise<StudentProfile> {
  return {} as StudentProfile; // Would query database
}

async function fetchStudentOutcomes(anonymousId: string): Promise<StudentOutcomes> {
  return {} as StudentOutcomes; // Would query database
}

async function getDatasetSize(): Promise<number> {
  return 25430; // Mock - would grow over time
}
