// API Types for CARSA Lens Agent
// Generated from OpenAPI specification

// Base Response Types
export interface BaseResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRequest {
  organization_name: string;
  organization_slug: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  accept_terms: boolean;
  accept_privacy: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserResponse;
  organization: OrganizationResponse;
}

export interface LoginResponse {
  message: string;
  tokens: TokenResponse;
  requires_verification: boolean;
}

export interface RegistrationResponse {
  message: string;
  user: UserResponse;
  organization: OrganizationResponse;
  verification_sent: boolean;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  role: UserRole;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

// Type alias for convenience
export type User = UserResponse;

export interface SessionInfo extends UserResponse {
  organization: OrganizationResponse;
  permissions: string[];
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordChangeResponse {
  message: string;
  success: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
  success: boolean;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface EmailVerificationResponse {
  message: string;
  success: boolean;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface LogoutResponse {
  message: string;
  success: boolean;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: OrganizationSize;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
}

// Job Types
export interface JobCreateRequest {
  title: string;
  description?: string;
  department?: string;
  location?: string;
  job_type: JobType;
  job_mode: JobMode;
  seniority_level: SeniorityLevel;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
}

export interface JobResponse {
  id: string;
  title: string;
  description?: string;
  department?: string;
  location?: string;
  job_type: JobType;
  job_mode: JobMode;
  seniority_level: SeniorityLevel;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  status: JobStatus;
  organization_id: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  job_descriptions?: JobDescriptionResponse[];
  scorecards?: ScorecardResponse[];
}

export interface JobDescriptionResponse {
  id: string;
  job_id: string;
  title: string;
  content: string;
  version: number;
  is_active: boolean;
  processing_status: ProcessingStatus;
  extraction_metadata?: Record<string, unknown>;
  enhancement_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Candidate Types
export interface CVUploadResponse {
  message: string;
  candidate: CandidateResponse;
  storage_info: {
    storage_path: string;
    file_size: number;
    content_type: string;
  };
  processing_info: {
    extraction_errors: string[];
    confidence_score?: number;
    processing_method: string;
  };
}

export interface BatchCVUploadResponse {
  message: string;
  results: CVUploadResponse[];
  summary: {
    total_files: number;
    successful: number;
    failed: number;
    processing: number;
  };
}

export interface CandidateResponse {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  location?: string;
  source: CandidateSource;
  processing_status: ProcessingStatus;
  ai_provider?: string;
  confidence_score?: number;
  profile_data?: CandidateProfileData;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateProfileData {
  personal_info: {
    full_name: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  work_experience: WorkExperience[];
  education: Education[];
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  certifications: Certification[];
  summary?: string;
  achievements?: string[];
}

export interface WorkExperience {
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  description?: string;
  is_current: boolean;
}

export interface Education {
  degree: string;
  field_of_study?: string;
  institution: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
  description?: string;
}

export interface Certification {
  name: string;
  issuing_organization: string;
  issue_date?: string;
  expiration_date?: string;
  credential_id?: string;
  credential_url?: string;
}

// Evaluation Types
export interface EvaluateRequest {
  candidate_id: string;
  job_id: string;
  scorecard_id?: string;
  custom_instructions?: string;
}

export interface BatchEvaluateRequest {
  candidate_ids: string[];
  job_id: string;
  scorecard_id?: string;
  concurrency?: number;
  custom_instructions?: string;
}

export interface EvaluationResponse {
  id: string;
  candidate_id: string;
  job_id: string;
  scorecard_id: string;
  overall_score?: number;
  qualification_tier?: QualificationTier;
  scores: Record<string, CriterionScore>;
  strengths: string[];
  gaps: string[];
  interview_focus_areas: string[];
  recommendations: string;
  confidence_level: number;
  ai_model: string;
  evaluation_metadata: Record<string, unknown>;
  created_at: string;
}

export interface CriterionScore {
  score: number;
  max_score: number;
  percentage: number;
  confidence: number;
  evidence: string[];
  justification: string;
}

export interface BatchEvaluationResponse {
  job_id: string;
  total_candidates: number;
  successful_evaluations: number;
  failed_evaluations: number;
  evaluations: EvaluationResponse[];
  errors: string[];
}

// Scorecard Types
export interface ScorecardResponse {
  id: string;
  job_id: string;
  name: string;
  description?: string;
  criteria: EvaluationCriterion[];
  total_weight: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  max_score: number;
  sub_criteria?: SubCriterion[];
}

export interface SubCriterion {
  name: string;
  description: string;
  weight: number;
  max_score: number;
}

// Enums
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  HR = 'hr',
  USER = 'user',
}

export enum OrganizationSize {
  STARTUP = 'startup',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise',
}

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  TEMPORARY = 'temporary',
  INTERNSHIP = 'internship',
  FREELANCE = 'freelance',
}

export enum JobMode {
  ON_SITE = 'on_site',
  REMOTE = 'remote',
  HYBRID = 'hybrid',
}

export enum SeniorityLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  PRINCIPAL = 'principal',
  EXECUTIVE = 'executive',
}

export enum JobStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  CLOSED = 'closed',
}

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum CandidateSource {
  UPLOADED = 'uploaded',
  MANUAL = 'manual',
  IMPORTED = 'imported',
}

export enum QualificationTier {
  HIGHLY_QUALIFIED = 'highly_qualified',
  QUALIFIED = 'qualified',
  PARTIALLY_QUALIFIED = 'partially_qualified',
  NOT_QUALIFIED = 'not_qualified',
}

// API Error Types
export interface APIError {
  error: string;
  message: string;
  status_code: number;
  request_id: string;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// Pagination Types
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

// Filter Types
export interface JobFilters extends PaginationParams {
  status_filter?: JobStatus;
  department?: string;
}

export interface CandidateFilters extends PaginationParams {
  status_filter?: ProcessingStatus;
  source_filter?: CandidateSource;
  needs_review?: boolean;
  search?: string;
}

export interface EvaluationFilters extends PaginationParams {
  job_id?: string;
  candidate_id?: string;
  qualification_tier?: QualificationTier;
  min_score?: number;
  max_score?: number;
}