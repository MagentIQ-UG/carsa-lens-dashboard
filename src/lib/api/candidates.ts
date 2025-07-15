import {
  CandidateResponse,
  CandidateFilters,
  CVUploadResponse,
  BatchCVUploadResponse,
  CandidateProfileData,
} from '@/types/api';

import { apiGet, apiPut, apiPost, uploadFile, uploadFiles } from './client';

// Candidates API endpoints
export const candidatesApi = {
  // CV Upload operations
  uploadCV: (
    file: File,
    extractProfile: boolean = true,
    onProgress?: (progress: number) => void
  ): Promise<CVUploadResponse> =>
    uploadFile('/candidates/upload', file, { extract_profile: extractProfile.toString() }, onProgress),

  batchUploadCVs: (
    files: File[],
    extractProfile: boolean = true,
    onProgress?: (progress: number) => void
  ): Promise<BatchCVUploadResponse> =>
    uploadFiles('/candidates/batch-upload', files, { extract_profile: extractProfile.toString() }, onProgress),

  // Candidate management
  listCandidates: (filters?: CandidateFilters): Promise<CandidateResponse[]> =>
    apiGet('/candidates/', { params: filters }),

  getCandidate: (candidateId: string): Promise<CandidateResponse> =>
    apiGet(`/candidates/${candidateId}`),

  // Profile management
  getCandidateProfile: (candidateId: string): Promise<{
    candidate: CandidateResponse;
    profile_data: CandidateProfileData;
    extraction_metadata: Record<string, unknown>;
  }> =>
    apiGet(`/candidates/${candidateId}/profile`),

  updateCandidateProfile: (
    candidateId: string,
    profileUpdates: Partial<CandidateProfileData>
  ): Promise<{ message: string; candidate: CandidateResponse }> =>
    apiPut(`/candidates/${candidateId}/profile`, profileUpdates),

  // Document management
  listCandidateDocuments: (candidateId: string): Promise<{
    id: string;
    candidate_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    storage_path: string;
    upload_date: string;
    processing_status: string;
  }[]> =>
    apiGet(`/candidates/${candidateId}/documents`),

  // Reprocessing
  reprocessCandidate: (
    candidateId: string,
    extractProfile: boolean = true
  ): Promise<{ message: string; processing_id: string }> =>
    apiPost(`/candidates/${candidateId}/reprocess`, {}, { params: { extract_profile: extractProfile } }),

  // Processing status
  getProcessingStatus: (params?: {
    job_id?: string;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    limit?: number;
  }): Promise<{
    processing_jobs: Array<{
      id: string;
      candidate_id: string;
      status: string;
      progress: number;
      started_at: string;
      estimated_completion: string;
    }>;
    total_count: number;
  }> =>
    apiGet('/candidates/processing-status', { params }),

  // Health checks
  checkProcessingHealth: (): Promise<{
    status: string;
    queue_size: number;
    processing_capacity: number;
    average_processing_time: number;
  }> =>
    apiGet('/candidates/health/processing'),

  checkGeneralHealth: (): Promise<{
    status: string;
    services: Record<string, any>;
  }> =>
    apiGet('/candidates/health'),
};

export default candidatesApi;