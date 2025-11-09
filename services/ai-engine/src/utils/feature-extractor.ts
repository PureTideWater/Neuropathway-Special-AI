/**
 * Feature Extractor for ML Goal Prediction
 * Extracts and transforms IEP goal data into ML features
 */

import { logger } from './logger';

export interface GoalFeatures {
  // Target information
  days_until_target: number;
  current_progress: number; // % (0-100)
  target_progress: number; // % (0-100)

  // Progress rates
  progress_rate: number; // % progress per week
  required_rate: number; // % per week needed to meet goal
  recent_trend: number; // Slope of last 3 weeks (-1 to +1)

  // Intervention data
  intervention_count: number;
  intervention_frequency: number; // Sessions per week
  accommodation_usage: number; // 0-1 (how often accommodations are used)

  // Student engagement
  attendance_rate: number; // 0-1
  parent_engagement_rate: number; // 0-1 (communication response rate)

  // Historical performance
  previous_goal_success_rate: number; // 0-1 (% of previous goals met)
  time_in_program: number; // Months in special education

  // Metadata
  goal_domain: string; // 'Reading', 'Math', 'Behavior', etc.
  grade_level: number;
  disability_category: string;
}

/**
 * Extract features from goal and related data
 * In production: This queries the database and computes features
 */
export async function extractGoalFeatures(goalId: string): Promise<GoalFeatures> {
  logger.info('Extracting features for goal', { goalId });

  // In production: Query database for goal, student, progress monitoring data
  // SELECT g.*, s.*, pm.progress_data
  // FROM iep_goals g
  // JOIN students s ON g.student_id = s.id
  // JOIN progress_monitoring pm ON g.id = pm.goal_id

  // Mock data for demonstration
  const goalData = await fetchGoalData(goalId);
  const progressData = await fetchProgressMonitoring(goalId);
  const studentData = await fetchStudentData(goalData.student_id);

  // Calculate temporal features
  const currentProgress = calculateCurrentProgress(progressData);
  const progressRate = calculateProgressRate(progressData);
  const recentTrend = calculateRecentTrend(progressData);
  const requiredRate = calculateRequiredRate(
    currentProgress,
    goalData.target_progress,
    goalData.days_until_target
  );

  // Calculate engagement features
  const attendanceRate = calculateAttendanceRate(studentData);
  const accommodationUsage = calculateAccommodationUsage(progressData);
  const parentEngagement = calculateParentEngagement(studentData);

  // Calculate historical features
  const previousSuccessRate = calculatePreviousGoalSuccessRate(studentData);

  const features: GoalFeatures = {
    days_until_target: goalData.days_until_target,
    current_progress: currentProgress,
    target_progress: goalData.target_progress,
    progress_rate: progressRate,
    required_rate: requiredRate,
    recent_trend: recentTrend,
    intervention_count: goalData.intervention_count,
    intervention_frequency: goalData.intervention_frequency,
    accommodation_usage: accommodationUsage,
    attendance_rate: attendanceRate,
    parent_engagement_rate: parentEngagement,
    previous_goal_success_rate: previousSuccessRate,
    time_in_program: studentData.months_in_program,
    goal_domain: goalData.domain,
    grade_level: studentData.grade_level,
    disability_category: studentData.disability_category,
  };

  logger.info('Features extracted successfully', {
    goalId,
    currentProgress,
    progressRate,
    requiredRate,
    trend: recentTrend,
  });

  return features;
}

/**
 * Fetch goal data from database
 */
async function fetchGoalData(goalId: string): Promise<any> {
  // Mock data - in production, query database
  return {
    id: goalId,
    student_id: 'student-uuid-123',
    domain: 'Reading Comprehension',
    target_progress: 80.0, // Target is 80%
    target_date: new Date('2025-06-30'),
    days_until_target: 45,
    intervention_count: 2,
    intervention_frequency: 3.0, // 3x per week
    baseline: 45.0,
  };
}

/**
 * Fetch progress monitoring data (JSONB column with temporal progress records)
 */
async function fetchProgressMonitoring(goalId: string): Promise<any[]> {
  // Mock progress data - in production, query progress_monitoring table
  // The JSONB column stores: { date, progress_score, notes, accommodations_used }
  return [
    { date: '2024-09-15', progress: 45.0, accommodations_used: true },
    { date: '2024-09-22', progress: 48.0, accommodations_used: true },
    { date: '2024-09-29', progress: 52.0, accommodations_used: true },
    { date: '2024-10-06', progress: 55.0, accommodations_used: false },
    { date: '2024-10-13', progress: 58.0, accommodations_used: true },
    { date: '2024-10-20', progress: 60.0, accommodations_used: true },
    { date: '2024-10-27', progress: 61.0, accommodations_used: true },
    { date: '2024-11-03', progress: 59.0, accommodations_used: false }, // Decline!
    { date: '2024-11-10', progress: 58.0, accommodations_used: false }, // Further decline
  ];
}

/**
 * Fetch student data
 */
async function fetchStudentData(studentId: string): Promise<any> {
  return {
    id: studentId,
    grade_level: 4,
    disability_category: 'Specific Learning Disability',
    months_in_program: 18,
    attendance_records: [
      { week: '2024-10-01', days_present: 4, days_total: 5 },
      { week: '2024-10-08', days_present: 5, days_total: 5 },
      { week: '2024-10-15', days_present: 3, days_total: 5 }, // Low week
      { week: '2024-10-22', days_present: 4, days_total: 5 },
      { week: '2024-10-29', days_present: 5, days_total: 5 },
      { week: '2024-11-05', days_present: 4, days_total: 5 },
    ],
    parent_communications: [
      { date: '2024-10-01', responded: true, response_time_hours: 2 },
      { date: '2024-10-08', responded: true, response_time_hours: 24 },
      { date: '2024-10-15', responded: false, response_time_hours: null },
      { date: '2024-10-22', responded: true, response_time_hours: 12 },
      { date: '2024-10-29', responded: true, response_time_hours: 6 },
      { date: '2024-11-05', responded: true, response_time_hours: 3 },
    ],
    previous_goals: [
      { outcome: 'met', domain: 'Math' },
      { outcome: 'met', domain: 'Writing' },
      { outcome: 'not_met', domain: 'Reading' },
      { outcome: 'met', domain: 'Behavior' },
    ],
  };
}

/**
 * Calculate current progress (latest data point)
 */
function calculateCurrentProgress(progressData: any[]): number {
  if (progressData.length === 0) return 0;
  return progressData[progressData.length - 1].progress;
}

/**
 * Calculate progress rate (% per week)
 */
function calculateProgressRate(progressData: any[]): number {
  if (progressData.length < 2) return 0;

  const first = progressData[0];
  const last = progressData[progressData.length - 1];

  const progressGain = last.progress - first.progress;
  const weeksElapsed = progressData.length - 1;

  return weeksElapsed > 0 ? progressGain / weeksElapsed : 0;
}

/**
 * Calculate recent trend (slope of last 3 weeks)
 * Positive = improving, Negative = declining
 */
function calculateRecentTrend(progressData: any[]): number {
  if (progressData.length < 3) return 0;

  const recent = progressData.slice(-3);
  const first = recent[0].progress;
  const last = recent[recent.length - 1].progress;

  const trend = (last - first) / 2; // Over 2 weeks
  return trend / 100; // Normalize to -1 to +1
}

/**
 * Calculate required progress rate to meet goal
 */
function calculateRequiredRate(
  currentProgress: number,
  targetProgress: number,
  daysRemaining: number
): number {
  if (daysRemaining <= 0) return 0;

  const progressNeeded = targetProgress - currentProgress;
  const weeksRemaining = daysRemaining / 7;

  return weeksRemaining > 0 ? progressNeeded / weeksRemaining : 0;
}

/**
 * Calculate attendance rate (last 6 weeks)
 */
function calculateAttendanceRate(studentData: any): number {
  const records = studentData.attendance_records;
  if (records.length === 0) return 0.85; // Default assumption

  const totalDays = records.reduce((sum: number, r: any) => sum + r.days_total, 0);
  const presentDays = records.reduce((sum: number, r: any) => sum + r.days_present, 0);

  return totalDays > 0 ? presentDays / totalDays : 0.85;
}

/**
 * Calculate accommodation usage rate
 */
function calculateAccommodationUsage(progressData: any[]): number {
  if (progressData.length === 0) return 0.75; // Default

  const used = progressData.filter((p) => p.accommodations_used).length;
  return used / progressData.length;
}

/**
 * Calculate parent engagement rate (communication response rate)
 */
function calculateParentEngagement(studentData: any): number {
  const comms = studentData.parent_communications;
  if (comms.length === 0) return 0.75; // Default

  const responded = comms.filter((c: any) => c.responded).length;
  return responded / comms.length;
}

/**
 * Calculate previous goal success rate
 */
function calculatePreviousGoalSuccessRate(studentData: any): number {
  const goals = studentData.previous_goals;
  if (goals.length === 0) return 0.75; // Default assumption

  const met = goals.filter((g: any) => g.outcome === 'met').length;
  return met / goals.length;
}

/**
 * Normalize features for ML model (scale to 0-1 range)
 * In production: Use scikit-learn StandardScaler or MinMaxScaler
 */
export function normalizeFeatures(features: GoalFeatures): number[] {
  return [
    features.days_until_target / 365, // Normalize to 0-1 (assume max 365 days)
    features.current_progress / 100,
    features.target_progress / 100,
    features.progress_rate / 10, // Assume max 10% per week
    features.required_rate / 10,
    (features.recent_trend + 1) / 2, // Scale from -1,1 to 0,1
    features.intervention_count / 5, // Assume max 5 interventions
    features.intervention_frequency / 7, // Max 7x per week
    features.accommodation_usage,
    features.attendance_rate,
    features.parent_engagement_rate,
    features.previous_goal_success_rate,
    features.time_in_program / 60, // Normalize to 0-1 (max 60 months = 5 years)
  ];
}
