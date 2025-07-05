import {
  JobCreateRequest,
  JobResponse,
  JobFilters,
  JobDescriptionResponse,
} from '@/types/api';

import { apiGet, apiPost, apiPut, apiDelete, uploadFile } from './client';

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
  ): Promise<JobDescriptionResponse> =>
    uploadFile(`/jobs/${jobId}/upload-description`, file, {}, onProgress),

  generateJobDescription: (
    jobId: string,
    data: {
      title: string;
      department: string;
      requirements: string[];
      responsibilities: string[];
      custom_instructions?: string;
    },
    aiProvider?: string
  ): Promise<JobDescriptionResponse> =>
    apiPost(`/jobs/${jobId}/generate-description${aiProvider ? `?ai_provider=${aiProvider}` : ''}`, data),

  enhanceJobDescription: (
    jobId: string,
    jdId: string,
    data: {
      enhancement_types: ('clarity' | 'bias_detection' | 'keywords')[];
      custom_instructions?: string;
    },
    aiProvider?: string
  ): Promise<JobDescriptionResponse> =>
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
  ): Promise<{ message: string; scorecard_id: string }> =>
    apiPost(`/jobs/${jobId}/descriptions/${jdId}/generate-scorecard${customInstructions ? `?custom_instructions=${encodeURIComponent(customInstructions)}` : ''}`),

  // Health checks
  checkAIServices: (): Promise<{
    status: string;
    services: Record<string, { status: string; response_time?: number }>;
  }> =>
    apiGet('/jobs/health/ai-services'),
};

export default jobsApi;