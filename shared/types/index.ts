/**
 * PathWise - Shared TypeScript Types
 * Core type definitions used across all services
 */

// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export type UserRole = 'teacher' | 'admin' | 'parent' | 'student' | 'specialist';

export interface User {
  id: string;
  oauthSub: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  districtId?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push?: boolean;
  };
  theme: 'light' | 'dark' | 'high_contrast';
  language: string;
  accessibility?: AccessibilitySettings;
}

export interface AccessibilitySettings {
  fontSize?: 'small' | 'medium' | 'large' | 'extra_large';
  voiceNavigation?: boolean;
  screenReader?: boolean;
  reducedMotion?: boolean;
  colorBlindMode?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

// ============================================
// DISTRICT TYPES
// ============================================

export interface District {
  id: string;
  name: string;
  code: string;
  state: string;
  settings: DistrictSettings;
  complianceConfig: ComplianceConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DistrictSettings {
  timezone: string;
  academicYear: string;
  gradingScale?: Record<string, unknown>;
}

export interface ComplianceConfig {
  ferpaMode: 'standard' | 'strict';
  parentAccess: boolean;
  auditRetentionDays: number;
  dataResidency?: string;
}

// ============================================
// STUDENT TYPES
// ============================================

export interface Student {
  id: string;
  userId?: string;
  studentIdNumber: string;
  dateOfBirth: Date;
  gradeLevel: string;
  districtId: string;
  demographics: Demographics;
  profileJson: StudentProfile;
  learningPreferences: LearningPreferences;
  cognitiveProfile: CognitiveProfile;
  sensoryProfile: SensoryProfile;
  iepId?: string;
  primaryTeacherId?: string;
  guardianIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Demographics {
  gender?: string;
  ethnicity?: string;
  primaryLanguage: string;
  ellStatus?: boolean;
  freeReducedLunch?: boolean;
}

export interface StudentProfile {
  strengths: string[];
  challenges: string[];
  interests?: string[];
  medicalConsiderations?: string[];
}

export interface LearningPreferences {
  preferredModality: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
  pace: 'faster' | 'moderate' | 'slower';
  supportsNeeded: string[];
  bestTimeOfDay?: 'morning' | 'afternoon' | 'evening';
}

export interface CognitiveProfile {
  processingSpeed: 'above_average' | 'average' | 'below_average';
  workingMemory: 'above_average' | 'average' | 'below_average';
  attention: 'typical' | 'needs_support' | 'needs_significant_support';
  executiveFunction?: 'typical' | 'needs_support' | 'needs_significant_support';
}

export interface SensoryProfile {
  visual: 'typical' | 'sensitive' | 'seeking';
  auditory: 'typical' | 'sensitive' | 'seeking';
  tactile: 'typical' | 'sensitive' | 'seeking';
  proprioceptive?: 'typical' | 'sensitive' | 'seeking';
  vestibular?: 'typical' | 'sensitive' | 'seeking';
}

// ============================================
// IEP TYPES
// ============================================

export type IEPStatus = 'draft' | 'in_review' | 'approved' | 'active' | 'archived' | 'expired';

export interface IEP {
  id: string;
  studentId: string;
  version: number;
  status: IEPStatus;
  title?: string;
  goalText?: string;
  goals: IEPGoalSummary[];
  accommodationsJson: Accommodations;
  modifications: Record<string, unknown>;
  services: Service[];
  relatedServices: Service[];
  assessmentData: Record<string, unknown>;
  startDate?: Date;
  endDate?: Date;
  reviewDate?: Date;
  meetingDate?: Date;
  teamMembers: string[];
  createdBy?: string;
  approvedBy?: string;
  parentConsent: boolean;
  parentConsentDate?: Date;
  notes?: string;
  attachments: Attachment[];
  complianceChecklist: Record<string, boolean>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IEPGoalSummary {
  id: number;
  domain: string;
  goal: string;
  baseline: string;
  target: string;
  timeline: string;
}

export interface Accommodations {
  testing?: string[];
  classroom?: string[];
  materials?: string[];
  language?: string[];
  other?: string[];
}

export interface Service {
  service: string;
  frequency: string;
  duration: string;
  provider?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  fileType: string;
  s3Uri: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// ============================================
// IEP GOAL (Detailed) TYPES
// ============================================

export type GoalStatus = 'active' | 'achieved' | 'discontinued' | 'modified';

export interface IEPGoal {
  id: string;
  iepId: string;
  goalNumber: number;
  domain: string;
  goalText: string;
  baselineData?: string;
  targetCriteria?: string;
  measurementMethod?: string;
  timeline?: string;
  progressMonitoring: ProgressMonitoringEntry[];
  currentProgress?: number;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressMonitoringEntry {
  date: Date;
  score: number;
  notes?: string;
  recordedBy: string;
}

// ============================================
// CONTENT LIBRARY TYPES
// ============================================

export type ContentType = 'lesson' | 'activity' | 'assessment' | 'resource' | 'video' | 'audio' | 'document' | 'interactive';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'adaptive';

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  subject: string;
  gradeLevel?: string;
  contentType: ContentType;
  format: string;
  difficultyLevel?: DifficultyLevel;
  metadataJson: ContentMetadata;
  tags: string[];
  learningObjectives: string[];
  accessibilityFeatures: AccessibilityFeatures;
  s3Uri?: string;
  thumbnailUrl?: string;
  durationMinutes?: number;
  createdBy?: string;
  districtId?: string;
  isPublic: boolean;
  isActive: boolean;
  viewCount: number;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ContentMetadata {
  author?: string;
  standards?: string[];
  prerequisites?: string[];
  relatedContent?: string[];
  [key: string]: unknown;
}

export interface AccessibilityFeatures {
  textToSpeech?: boolean;
  adjustableFontSize?: boolean;
  highContrast?: boolean;
  audioSupport?: boolean;
  captions?: boolean;
  transcript?: boolean;
  bilingualSupport?: boolean;
  visualOrganizers?: boolean;
  adjustableDifficulty?: boolean;
  visualSupports?: boolean;
}

// ============================================
// SESSION TYPES
// ============================================

export type SessionType = 'adaptive_learning' | 'assessment' | 'practice' | 'review';
export type CompletionStatus = 'in_progress' | 'completed' | 'abandoned' | 'interrupted';

export interface Session {
  id: string;
  studentId: string;
  lessonId?: string;
  sessionType: SessionType;
  startTime: Date;
  endTime?: Date;
  durationSeconds?: number;
  metricsJson: SessionMetrics;
  engagementScore?: number;
  accuracyScore?: number;
  completionStatus: CompletionStatus;
  contentDelivered: unknown[];
  studentResponses: unknown[];
  aiAdaptations: AIAdaptation[];
  teacherNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionMetrics {
  questionsAttempted?: number;
  questionsCorrect?: number;
  hintsUsed?: number;
  timePerQuestionAvg?: number;
  [key: string]: unknown;
}

export interface AIAdaptation {
  timestamp: Date;
  adaptationType: 'difficulty' | 'content' | 'pace' | 'modality' | 'support';
  description: string;
  reasoning: string;
}

// ============================================
// AI AUDIT TYPES
// ============================================

export interface AIAudit {
  id: string;
  userId?: string;
  studentId?: string;
  serviceName: string;
  operationType: string;
  prompt?: string;
  promptHash?: string;
  responseText?: string;
  responseHash?: string;
  modelUsed?: string;
  tokensUsed?: number;
  latencyMs?: number;
  success: boolean;
  errorMessage?: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  timestamp: Date;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push';

export interface Notification {
  id: string;
  recipientId: string;
  senderId?: string;
  type: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  channel?: NotificationChannel;
  isRead: boolean;
  readAt?: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// ============================================
// AUDIT LOG TYPES
// ============================================

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  changes: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: ResponseMetadata;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ResponseMetadata {
  page?: number;
  pageSize?: number;
  totalCount?: number;
  hasMore?: boolean;
}

export interface PaginatedRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

// ============================================
// AI SERVICE TYPES
// ============================================

export interface IEPGenerationRequest {
  studentId: string;
  teacherNotes?: string;
  previousIEPId?: string;
  focusAreas?: string[];
}

export interface IEPGenerationResponse {
  goals: GeneratedGoal[];
  accommodations: Accommodations;
  services: Service[];
  rationale: string;
  confidence: number;
}

export interface GeneratedGoal {
  domain: string;
  goalText: string;
  baseline: string;
  target: string;
  measurementMethod: string;
  timeline: string;
  confidence: number;
}

export interface AdaptiveLearningRequest {
  studentId: string;
  subject: string;
  sessionHistory: Session[];
  currentPerformance: Record<string, number>;
}

export interface AdaptiveLearningResponse {
  recommendedContent: ContentItem[];
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number;
  rationale: string;
  adaptations: AIAdaptation[];
}

// ============================================
// CHART/VISUALIZATION TYPES
// ============================================

export interface ChartDataPoint {
  date: Date;
  value: number;
  label?: string;
}

export interface ProgressChartData {
  goalId: string;
  goalName: string;
  dataPoints: ChartDataPoint[];
  targetValue: number;
  currentValue: number;
}

// ============================================
// PERMISSION TYPES
// ============================================

export type Permission =
  | 'iep:read'
  | 'iep:write'
  | 'iep:approve'
  | 'student:view'
  | 'student:edit'
  | 'content:view'
  | 'content:create'
  | 'content:edit'
  | 'analytics:view'
  | 'admin:manage_users'
  | 'admin:manage_district';

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'student',
    permissions: ['content:view'],
  },
  {
    role: 'parent',
    permissions: ['iep:read', 'student:view'],
  },
  {
    role: 'teacher',
    permissions: [
      'iep:read',
      'iep:write',
      'student:view',
      'student:edit',
      'content:view',
      'content:create',
      'content:edit',
      'analytics:view',
    ],
  },
  {
    role: 'specialist',
    permissions: [
      'iep:read',
      'iep:write',
      'student:view',
      'student:edit',
      'content:view',
      'analytics:view',
    ],
  },
  {
    role: 'admin',
    permissions: [
      'iep:read',
      'iep:write',
      'iep:approve',
      'student:view',
      'student:edit',
      'content:view',
      'content:create',
      'content:edit',
      'analytics:view',
      'admin:manage_users',
      'admin:manage_district',
    ],
  },
];
