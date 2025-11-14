/**
 * AI Engine Types
 */

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
