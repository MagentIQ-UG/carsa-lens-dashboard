import {
  JobCreateRequest,
  JobResponse,
  JobFilters,
  JobDescriptionResponse,
  JDGenerationRequest,
  JDEnhancementRequest,
  JDUploadResponse,
  JDEnhancementResponse,
  ScorecardGenerationResponse,
} from '@/types/api';

import { apiGet, apiPost, apiPut, apiDelete, apiPatch, uploadFile } from './client';

// Jobs API endpoints
export const jobsApi = {
  // Job CRUD operations
  createJob: (data: JobCreateRequest): Promise<JobResponse> =>
    apiPost('/jobs/', data),

  listJobs: (filters?: JobFilters): Promise<JobResponse[]> =>
    apiGet('/jobs/', { params: filters }),

  getJob: (jobId: string): Promise<JobResponse> =>
    apiGet(`/jobs/${jobId}`),

  updateJob: (jobId: string, data: Partial<JobCreateRequest>): Promise<JobResponse> =>
    apiPut(`/jobs/${jobId}`, data),

  deleteJob: (jobId: string): Promise<{ message: string }> =>
    apiDelete(`/jobs/${jobId}`),

  // Job Description operations
  uploadJobDescription: (
    jobId: string, 
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<JDUploadResponse> =>
    uploadFile(`/jobs/${jobId}/upload-description`, file, {}, onProgress),

  generateJobDescription: (
    jobId: string,
    data: JDGenerationRequest,
    aiProvider?: string
  ): Promise<JobDescriptionResponse> =>
    apiPost(`/jobs/${jobId}/generate-description${aiProvider ? `?ai_provider=${aiProvider}` : ''}`, data),

  enhanceJobDescription: (
    jobId: string,
    jdId: string,
    data: JDEnhancementRequest,
    aiProvider?: string
  ): Promise<JDEnhancementResponse> =>
    apiPost(`/jobs/${jobId}/descriptions/${jdId}/enhance${aiProvider ? `?ai_provider=${aiProvider}` : ''}`, data),

  // Job Description management
  listJobDescriptions: (
    jobId: string,
    includeHistory: boolean = false
  ): Promise<JobDescriptionResponse[]> =>
    apiGet(`/jobs/${jobId}/descriptions`, { params: { include_history: includeHistory } }),

  getJobDescription: (jobId: string, jdId: string): Promise<JobDescriptionResponse> =>
    apiGet(`/jobs/${jobId}/descriptions/${jdId}`),

  // Scorecard generation
  generateScorecard: (
    jobId: string,
    jdId: string,
    customInstructions?: string
  ): Promise<ScorecardGenerationResponse> =>
    apiPost(`/jobs/${jobId}/descriptions/${jdId}/generate-scorecard`, 
      customInstructions ? { custom_instructions: customInstructions } : {}),

  // Scorecard management
  listJobScorecards: (
    jobId: string,
    includeArchived: boolean = false
  ): Promise<any[]> =>
    apiGet(`/jobs/${jobId}/scorecards`, { params: { include_archived: includeArchived } }),

  getScorecard: (scorecardId: string): Promise<any> =>
    apiGet(`/jobs/scorecards/${scorecardId}`),

  updateScorecard: (
    scorecardId: string,
    data: any
  ): Promise<{ message: string; scorecard: any }> =>
    apiPut(`/jobs/scorecards/${scorecardId}`, data),

  approveScorecard: (
    scorecardId: string,
    action: 'approve' | 'reject' | 'request_changes' = 'approve',
    comment?: string
  ): Promise<{ message: string; scorecard: any }> =>
    apiPatch(`/jobs/scorecards/${scorecardId}/approval`, {
      action,
      comment: comment || undefined
    }),

  // Health checks
  checkAIServices: (): Promise<{
    status: string;
    services: Record<string, { status: string; response_time?: number }>;
  }> =>
    apiGet('/jobs/health/ai-services'),
};

export default jobsApi;