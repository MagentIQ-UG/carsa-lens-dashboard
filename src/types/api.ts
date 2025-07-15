// API Types for CARSA Lens Agent
// Generated from OpenAPI specification

// Base Response Types
export interface BaseResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Analytics Types
export interface AnalyticsOverview {
  jobs?: {
    total: number;
    active: number;
    draft: number;
    closed: number;
  };
  candidates?: {
    total: number;
    new: number;
    evaluated: number;
    shortlisted: number;
  };
  performance?: {
    time_to_hire: number;
    hire_rate: number;
    candidate_quality: number;
    evaluation_speed: number;
  };
  trends?: {
    job_growth: number;
    candidate_growth: number;
    evaluation_trend: number;
  };
}

export interface AnalyticsReport {
  id: string;
  title: string;
  type: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  data?: any;
  summary?: string;
  charts?: any[];
}

export interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'alert';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  dismissed: boolean;
  created_at: string;
  data?: any;
}

export interface AnalyticsUsage {
  period: string;
  total_requests: number;
  unique_users: number;
  feature_usage: Record<string, number>;
  performance_metrics: {
    average_response_time: number;
    error_rate: number;
    uptime: number;
  };
}

export interface AnalyticsMetrics {
  metric_name: string;
  metric_value: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ReportGenerationRequest {
  type: 'hiring' | 'candidates' | 'performance' | 'diversity';
  date_range: {
    start: string;
    end: string;
  };
  job_id?: string;
  filters?: Record<string, any>;
}

export interface InsightGenerationRequest {
  type: 'trend' | 'anomaly' | 'recommendation';
  data_source: 'jobs' | 'candidates' | 'evaluations' | 'rankings';
  parameters?: Record<string, any>;
}

export interface MetricRecordRequest {
  metric_name: string;
  metric_value: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface EventTrackingRequest {
  event_type: string;
  event_data: Record<string, any>;
  timestamp: string;
  user_id?: string;
}

// Rankings Types
export interface RankingResponse {
  id: string;
  job_id: string;
  candidate_id: string;
  rank: number;
  score: number;
  confidence: number;
  criteria_scores: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface RankingCreateRequest {
  job_id: string;
  candidate_id: string;
  criteria_weights?: Record<string, number>;
  custom_parameters?: Record<string, any>;
}

export interface RankingFilters {
  job_id?: string;
  candidate_id?: string;
  min_score?: number;
  max_score?: number;
  limit?: number;
  offset?: number;
}

export interface RankingAnalytics {
  ranking_id: string;
  total_candidates: number;
  score_distribution: Record<string, number>;
  top_criteria: string[];
  average_confidence: number;
  diversity_metrics: {
    gender_distribution: Record<string, number>;
    age_distribution: Record<string, number>;
    location_distribution: Record<string, number>;
  };
}

export interface RankingComparison {
  base_ranking_id: string;
  compared_rankings: string[];
  correlation_scores: Record<string, number>;
  differences: Array<{
    candidate_id: string;
    rank_difference: number;
    score_difference: number;
  }>;
}

export interface DiversityReport {
  ranking_id: string;
  diversity_score: number;
  metrics: {
    gender_balance: number;
    age_diversity: number;
    location_diversity: number;
    education_diversity: number;
    experience_diversity: number;
  };
  recommendations: string[];
}

export interface ShortlistResponse {
  id: string;
  job_id: string;
  name: string;
  description?: string;
  candidate_ids: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'archived';
}

export interface ShortlistCreateRequest {
  job_id: string;
  name: string;
  description?: string;
  candidate_ids: string[];
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
  salary_currency: string;
}

// Job Description Generation Types
export interface JDGenerationRequest {
  title: string;
  department?: string;
  seniority_level: string;
  job_type: string;
  job_mode: string;
  location?: string;
  company_name?: string;
  company_description?: string;
  key_responsibilities: string[];
  required_skills: string[];
  preferred_skills: string[];
  benefits: string[];
  salary_range?: string;
  custom_instructions?: string;
}

// Job Description Enhancement Types
export interface JDEnhancementRequest {
  enhancement_types: ('clarity' | 'bias_detection' | 'keywords')[];
  custom_instructions?: string;
  target_audience?: string;
}

export interface BiasFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  text: string;
  suggestion: string;
  line_number?: number;
}

export interface EnhancementSuggestion {
  type: string;
  original_text: string;
  suggested_text: string;
  reason: string;
  confidence: number;
}

export interface JDAnalysisResult {
  enhanced_content: string;
  bias_flags: BiasFlag[];
  enhancement_suggestions: EnhancementSuggestion[];
  keyword_suggestions: string[];
  clarity_score: number;
  bias_score: number;
  overall_quality_score: number;
}

export interface JDUploadResponse {
  message: string;
  job_description: JobDescriptionResponse;
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

export interface JDEnhancementResponse {
  message: string;
  enhanced_description: JobDescriptionResponse;
  analysis: {
    clarity_score: number;
    bias_score: number;
    overall_quality_score: number;
    bias_flags_count: number;
    enhancement_suggestions_count: number;
    keyword_suggestions: string[];
  };
}

export interface ScorecardGenerationResponse {
  message: string;
  scorecard: {
    id: string;
    name: string;
    criteria_count: number;
    storage_path: string;
    total_weight: number;
    is_active: boolean;
    is_approved?: boolean;
    ai_generated?: boolean;
    ai_provider?: string;
    passing_score?: number;
    created_at: string;
  };
  criteria_summary: Array<{
    name: string;
    category: string;
    importance: string;
    weight: number;
  }>;
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
  is_active: boolean;
  organization_id: string;
  created_by_id: string;
  job_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface JobDescriptionResponse {
  id: string;
  content: string;
  title?: string;
  source: 'generated' | 'uploaded' | 'manual' | 'enhanced';
  version: number;
  is_current: boolean;
  ai_provider?: string;
  ai_model?: string;
  confidence_score?: number;
  enhancement_applied: boolean;
  bias_checked: boolean;
  structured_data: Record<string, any>;
  enhancement_suggestions: Array<Record<string, any>>;
  bias_flags: Array<Record<string, any>>;
  keyword_suggestions: string[];
  job_id: string;
  created_by_id?: string;
  original_filename?: string;
  file_size?: number;
  processing_method?: string;
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
    portfolio_url?: string;
    website?: string;
    twitter?: string;
    stackoverflow?: string;
    behance?: string;
    dribbble?: string;
    other_urls?: string[];
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
  status?: string;
  criteria: EvaluationCriterion[];
  criteria_count?: number;
  storage_path?: string;
  total_weight: number;
  is_active: boolean;
  is_approved?: boolean;
  ai_generated?: boolean;
  ai_provider?: string;
  ai_model?: string;
  ai_confidence?: number;
  passing_score?: number;
  job_description_id?: string;
  organization_id?: string;
  created_by_id?: string;
  approved_by_id?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
}

export interface ScorecardSummaryResponse {
  id: string;
  name: string;
  status: string;
  is_approved: boolean;
  criteria_count: number;
  total_weight: number;
  job_id: string;
  job_title: string;
  created_at: string;
  updated_at: string;
}

export interface ScorecardUpdateRequest {
  name?: string;
  description?: string;
  criteria?: ScorecardCriterionUpdate[];
  passing_score?: number;
  status?: string;
}

export interface ScorecardCriterion {
  criterion_id?: string;
  criterion_name: string;
  category?: string;
  description?: string;
  importance?: string;
  weight: number;
  scoring_method?: any;
  user_can_edit_weight?: boolean;
  user_can_edit_scoring?: boolean;
  user_can_remove?: boolean;
}

export interface ScorecardCriterionUpdate {
  criterion_id: string;
  criterion_name?: string;
  category?: string;
  description?: string;
  importance?: string;
  weight?: number;
  scoring_method?: any;
  user_can_edit_weight?: boolean;
  user_can_edit_scoring?: boolean;
  user_can_remove?: boolean;
}

export interface ScorecardApprovalRequest {
  action: string;
  comments?: string;
  changes_requested?: string[];
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