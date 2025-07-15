/**
 * Candidate Management API Hooks
 * TanStack Query hooks for candidate operations with modern patterns
 * 
 * NOTE: Some endpoints use mock data where backend implementation is pending.
 * See BACKEND_ENDPOINTS_REQUIREMENTS.md for details.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { apiClient, getAccessToken } from '@/lib/api/client';
import { cleanProfileUrls, enhanceExistingProfile } from '@/lib/utils/profile-enhancement';
import type {
  CandidateResponse,
} from '@/types/api';
import {
  ProcessingStatus,
  CandidateSource,
} from '@/types/api';

// Types for candidate operations matching actual API
interface CVUploadRequest {
  file: File;
  // Note: job_id, tags, and source are not supported by the upload API
  // These need to be handled through separate endpoints after upload
}

interface CVUploadResponse {
  candidate: CandidateResponse;
  document: {
    id: string;
    filename: string;
    file_size: number;
    file_type: string;
    upload_date: string;
    file_url?: string;
  };
  profile_extracted: boolean;
  processing_errors: string[];
}

interface BatchCVUploadResponse {
  results: CVUploadResponse[];
  summary: {
    successful: number;
    failed: number;
    total_files: number;
  };
  processing_errors: string[];
}

interface CandidateListRequest {
  search?: string;
  status_filter?: ProcessingStatus;
  source_filter?: CandidateSource;
  job_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface CandidateListResponse {
  items: CandidateResponse[];
  total: number;
  page: number;
  limit: number;
}

interface CandidateUpdateRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  processing_status?: ProcessingStatus;
  profile_data?: any;
}

// Query Keys
export const candidateKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  list: (filters: string) => [...candidateKeys.lists(), filters] as const,
  details: () => [...candidateKeys.all, 'detail'] as const,
  detail: (id: string) => [...candidateKeys.details(), id] as const,
  profile: (id: string) => [...candidateKeys.detail(id), 'profile'] as const,
  documents: (id: string) => [...candidateKeys.detail(id), 'documents'] as const,
  processing: () => [...candidateKeys.all, 'processing'] as const,
  health: () => [...candidateKeys.all, 'health'] as const,
  stats: () => [...candidateKeys.all, 'stats'] as const,
};

// API Endpoints
const ENDPOINTS = {
  candidates: '/candidates',
  candidateById: (id: string) => `/candidates/${id}`,
  candidateProfile: (id: string) => `/candidates/${id}/profile`,
  candidateDocuments: (id: string) => `/candidates/${id}/documents`,
  reprocessCandidate: (id: string) => `/candidates/${id}/reprocess`,
  uploadCV: '/candidates/upload',
  batchUploadCV: '/candidates/batch-upload',
  candidateStats: '/candidates/stats',
  processingStatus: '/candidates/processing-status',
  healthProcessing: '/candidates/health/processing',
  health: '/candidates/health',
};

// Candidate List Query
export function useCandidates(params: CandidateListRequest = {}) {
  const queryKey = candidateKeys.list(JSON.stringify(params));
  
  return useQuery({
    queryKey,
    queryFn: async (): Promise<CandidateListResponse> => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔍 Fetching candidates with params:', params);
        console.warn('🔍 Auth token status:', getAccessToken() ? 'Present' : 'Missing');
      }
      
      try {
        const response = await apiClient.get(ENDPOINTS.candidates, { params });
        if (process.env.NODE_ENV === 'development') {
          console.warn('✅ Candidates API response:', response.data);
        }
        
        // Validate response structure
        if (!response.data || typeof response.data !== 'object') {
          console.error('❌ Invalid API response structure:', response.data);
          throw new Error('Invalid API response structure');
        }
        
        // Handle different response formats
        if (Array.isArray(response.data)) {
          // If response is just an array of candidates
          return {
            items: response.data,
            total: response.data.length,
            page: 1,
            limit: params.limit || 50,
          };
        } else if (response.data.items && Array.isArray(response.data.items)) {
          // If response has the expected structure
          return {
            items: response.data.items,
            total: response.data.total || response.data.items.length,
            page: response.data.page || 1,
            limit: response.data.limit || params.limit || 50,
          };
        } else {
          console.error('❌ Unexpected response format:', response.data);
          throw new Error('Unexpected response format');
        }
      } catch (error) {
        console.error('❌ Failed to fetch candidates:', error);
        console.error('❌ Auth token status:', getAccessToken() ? 'Present' : 'Missing');
        console.error('❌ Full error details:', error);
        
        // Don't return empty result - let React Query handle the error
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1, // Retry once on failure
  });
}

// Single Candidate Query
export function useCandidate(candidateId: string) {
  return useQuery({
    queryKey: candidateKeys.detail(candidateId),
    queryFn: async (): Promise<CandidateResponse | null> => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔍 Fetching candidate details for ID:', candidateId);
      }
      
      try {
        const response = await apiClient.get(ENDPOINTS.candidateById(candidateId));
        if (process.env.NODE_ENV === 'development') {
          console.warn('✅ Candidate API response:', response.data);
          console.warn('📋 Profile data structure:', response.data.profile_data);
        }
        
        // Check if we have the expected data structure
        if (!response.data) {
          console.error('❌ No data in candidate response');
          return null;
        }
        
        return response.data;
      } catch (error) {
        console.error(`❌ Failed to fetch candidate ${candidateId}:`, error);
        return null;
      }
    },
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Retry once on failure
  });
}

// Candidate Stats Query - Stats endpoint not yet available, using derived stats
export function useCandidateStats() {
  return useQuery({
    queryKey: candidateKeys.stats(),
    queryFn: async () => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔍 Fetching candidate stats...');
      }
      
      try {
        // Get candidate list to derive stats since /stats endpoint doesn't exist yet
        const response = await apiClient.get(ENDPOINTS.candidates, { 
          params: { limit: 1000 } // Get large sample to calculate stats
        });
        if (process.env.NODE_ENV === 'development') {
          console.warn('✅ Stats API response:', response.data);
        }
        
        // Handle different response formats
        let candidates: any[] = [];
        if (Array.isArray(response.data)) {
          candidates = response.data;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          candidates = response.data.items;
        } else {
          console.error('❌ Unexpected stats response format:', response.data);
          candidates = [];
        }
        
        // Calculate stats from candidate data
        const total = candidates.length;
        const processing = candidates.filter((c: any) => c.processing_status === 'processing').length;
        const completed = candidates.filter((c: any) => c.processing_status === 'completed').length;
        const failed = candidates.filter((c: any) => c.processing_status === 'failed').length;
        
        // Calculate this week's candidates
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeek = candidates.filter((c: any) => 
          c.created_at && new Date(c.created_at) > oneWeekAgo
        ).length;
        
        const stats = {
          total,
          processing,
          completed,
          failed,
          this_week: thisWeek,
        };
        
        if (process.env.NODE_ENV === 'development') {
          console.warn('✅ Calculated stats:', stats);
        }
        return stats;
      } catch (error) {
        console.error('❌ Failed to fetch candidates for stats calculation:', error);
        // Return fallback data on error
        return {
          total: 0,
          processing: 0,
          completed: 0,
          failed: 0,
          this_week: 0,
        };
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1, // Retry once on failure
  });
}

// CV Upload Mutation with retry and progress
export function useUploadCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CVUploadRequest & { 
      onProgress?: (progress: number) => void;
      retryCount?: number;
    }): Promise<CVUploadResponse> => {
      const formData = new FormData();
      formData.append('file', data.file);
      // The API only accepts 'file' and 'extract_profile' parameters
      formData.append('extract_profile', 'true');

      const maxRetries = 2;
      const currentRetry = data.retryCount || 0;

      try {
        const response = await apiClient.post(ENDPOINTS.uploadCV, formData, {
          headers: {
            // Remove default Content-Type so axios sets multipart/form-data with boundary
            'Content-Type': undefined,
          },
          timeout: 60000, // 60 seconds for file upload (increased from 30s)
          onUploadProgress: (progressEvent) => {
            if (data.onProgress && progressEvent.total) {
              const progress = (progressEvent.loaded / progressEvent.total) * 100;
              data.onProgress(Math.round(progress));
            }
          },
        });
        return response.data;
      } catch (error: any) {
        // Check if it's a timeout error and we haven't exceeded retry limit
        if (error.code === 'ECONNABORTED' && error.message?.includes('timeout') && currentRetry < maxRetries) {
          console.warn(`Upload timeout, retrying... (${currentRetry + 1}/${maxRetries})`);
          // Retry with increased timeout
          return await new Promise((resolve, reject) => {
            setTimeout(async () => {
              try {
                const retryResponse = await apiClient.post(ENDPOINTS.uploadCV, formData, {
                  headers: {
                    'Content-Type': undefined,
                  },
                  timeout: 90000, // 90 seconds for retry
                  onUploadProgress: (progressEvent) => {
                    if (data.onProgress && progressEvent.total) {
                      const progress = (progressEvent.loaded / progressEvent.total) * 100;
                      data.onProgress(Math.round(progress));
                    }
                  },
                });
                resolve(retryResponse.data);
              } catch (retryError) {
                reject(retryError);
              }
            }, 1000); // Wait 1 second before retry
          });
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('🎉 CV Upload successful:', data);
      }
      
      // Invalidate candidate lists and stats immediately
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.stats() });
      
      // Also invalidate specific candidate queries if ID is available
      if (data.candidate?.id) {
        queryClient.invalidateQueries({ queryKey: candidateKeys.detail(data.candidate.id) });
      }
      
      const candidateName = `${data.candidate.first_name} ${data.candidate.last_name}`;
      if (data.profile_extracted) {
        toast.success(`CV uploaded and profile extracted for ${candidateName}`);
      } else {
        toast.success(`CV uploaded for ${candidateName}, profile extraction pending`);
      }
      
      // Show any processing errors
      if (data.processing_errors && data.processing_errors.length > 0) {
        data.processing_errors.forEach(error => {
          toast.error(`Processing warning: ${error}`);
        });
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to upload CV';
      toast.error(message);
    },
  });
}

// Batch CV Upload Mutation
export function useBatchUploadCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { files: File[]; job_id?: string; tags?: string[] }): Promise<BatchCVUploadResponse> => {
      const formData = new FormData();
      
      // Append multiple files - API expects 'files' parameter
      data.files.forEach((file) => {
        formData.append('files', file);
      });
      
      // The API only accepts 'files' and 'extract_profile' parameters
      formData.append('extract_profile', 'true');

      const response = await apiClient.post(ENDPOINTS.batchUploadCV, formData, {
        headers: {
          // Remove default Content-Type so axios sets multipart/form-data with boundary
          'Content-Type': undefined,
        },
        timeout: 120000, // 120 seconds for batch upload (increased from 60s)
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate candidate lists
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.stats() });
      
      if (data.summary) {
        const { successful, failed, total_files } = data.summary;
        toast.success(`Batch upload completed: ${successful}/${total_files} successful${failed > 0 ? `, ${failed} failed` : ''}`);
      } else {
        toast.success(`Batch upload completed: ${data.results.length} files processed`);
      }
      
      // Show any processing errors
      if (data.processing_errors && data.processing_errors.length > 0) {
        data.processing_errors.forEach(error => {
          toast.error(`Processing warning: ${error}`);
        });
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to upload CVs';
      toast.error(message);
    },
  });
}

// Update Candidate Profile Mutation
export function useUpdateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ candidateId, data }: { candidateId: string; data: CandidateUpdateRequest }): Promise<CandidateResponse> => {
      // This endpoint is not yet implemented - using mock data
      console.warn(`Update candidate endpoint not yet implemented for ${candidateId}, using mock response`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a mock updated candidate
      return {
        id: candidateId,
        first_name: data.first_name || 'Mock',
        last_name: data.last_name || 'Candidate',
        email: data.email || 'mock@example.com',
        phone: data.phone || '+1234567890',
        location: data.location || 'New York, NY',
        source: 'UPLOADED' as any,
        processing_status: data.processing_status || 'PENDING' as any,
        confidence_score: 0.85,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_data: data.profile_data,
      } as CandidateResponse;
    },
    onSuccess: (data) => {
      // Update the candidate in cache
      queryClient.setQueryData(candidateKeys.detail(data.id), data);
      
      // Invalidate candidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      
      toast.success(`Profile updated for ${data.first_name} ${data.last_name}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update candidate';
      toast.error(message);
    },
  });
}

// Delete Candidate Mutation
export function useDeleteCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidateId: string): Promise<void> => {
      // This endpoint is not yet implemented - using mock response
      console.warn(`Delete candidate endpoint not yet implemented for ${candidateId}, using mock response`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful deletion
      return;
    },
    onSuccess: (_, candidateId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: candidateKeys.detail(candidateId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.stats() });
      
      toast.success('Candidate deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete candidate';
      toast.error(message);
    },
  });
}

// Extract Profile Mutation (for re-processing)
export function useExtractProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidateId: string): Promise<CandidateResponse> => {
      // This endpoint is not yet implemented - using mock response
      console.warn(`Extract profile endpoint not yet implemented for ${candidateId}, using mock response`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Return a mock extracted candidate
      return {
        id: candidateId,
        first_name: 'Mock',
        last_name: 'Candidate',
        email: 'mock@example.com',
        phone: '+1234567890',
        location: 'New York, NY',
        source: 'UPLOADED' as any,
        processing_status: 'COMPLETED' as any,
        confidence_score: 0.92,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_data: {
          personal_info: {
            full_name: 'Mock Candidate',
            email: 'mock.candidate@verylongcompanyname.com',
            phone: '+1234567890',
            location: 'New York, NY',
            linkedin: 'https://linkedin.com/in/mockcandidate',
            github: 'https://github.com/mockcandidate',
            portfolio_url: 'https://mockcandidate.dev',
            website: 'https://mockcandidate.com',
            twitter: 'https://twitter.com/mockcandidate',
            stackoverflow: 'https://stackoverflow.com/users/123456/mockcandidate',
          },
          work_experience: [
            {
              title: 'Senior Software Engineer',
              company: 'Tech Innovation Inc',
              location: 'San Francisco, CA',
              start_date: '2023-01-01',
              is_current: true,
              description: 'Leading frontend development team, architecting scalable React applications',
            },
            {
              title: 'Software Engineer',
              company: 'Tech Corp',
              location: 'New York, NY',
              start_date: '2020-01-01',
              end_date: '2022-12-31',
              is_current: false,
              description: 'Developed web applications using React and Node.js',
            },
          ],
          education: [
            {
              degree: 'Bachelor of Science in Computer Science',
              institution: 'University of Technology',
              field_of_study: 'Computer Science',
              start_date: '2016-09-01',
              end_date: '2020-06-30',
            },
          ],
          skills: {
            technical: ['JavaScript', 'React', 'Node.js', 'Python'],
            soft: ['Problem Solving', 'Team Work', 'Communication'],
            languages: ['English', 'Spanish'],
          },
          certifications: [
            {
              name: 'AWS Certified Developer',
              issuing_organization: 'Amazon Web Services',
              issue_date: '2021-06-01',
            },
          ],
        },
      } as CandidateResponse;
    },
    onSuccess: (data) => {
      // Update the candidate in cache
      queryClient.setQueryData(candidateKeys.detail(data.id), data);
      
      // Invalidate candidate lists
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      
      toast.success('Profile extraction started');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to extract profile';
      toast.error(message);
    },
  });
}

// Utility function to get status color
export function getStatusColor(status: ProcessingStatus): string {
  switch (status) {
    case ProcessingStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case ProcessingStatus.PROCESSING:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case ProcessingStatus.COMPLETED:
      return 'bg-green-100 text-green-800 border-green-200';
    case ProcessingStatus.FAILED:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Utility function to get source color
export function getSourceColor(source: CandidateSource): string {
  switch (source) {
    case CandidateSource.UPLOADED:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case CandidateSource.MANUAL:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case CandidateSource.IMPORTED:
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Format processing status
export function formatProcessingStatus(status: ProcessingStatus): string {
  switch (status) {
    case ProcessingStatus.PENDING:
      return 'Pending';
    case ProcessingStatus.PROCESSING:
      return 'Processing';
    case ProcessingStatus.COMPLETED:
      return 'Completed';
    case ProcessingStatus.FAILED:
      return 'Failed';
    default:
      return 'Unknown';
  }
}

// Format candidate source
export function formatCandidateSource(source: CandidateSource): string {
  switch (source) {
    case CandidateSource.UPLOADED:
      return 'CV Upload';
    case CandidateSource.MANUAL:
      return 'Manual Entry';
    case CandidateSource.IMPORTED:
      return 'Bulk Import';
    default:
      return 'Unknown';
  }
}

// ===== NEW HOOKS FOR AVAILABLE ENDPOINTS =====

// Get Candidate Profile
export function useCandidateProfile(candidateId: string) {
  return useQuery({
    queryKey: candidateKeys.profile(candidateId),
    queryFn: async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.candidateProfile(candidateId));
        
        // Enhance and clean URLs in the profile data
        if (response.data?.profile_data) {
          // First enhance with any missing URLs from text content
          response.data.profile_data = enhanceExistingProfile(response.data.profile_data);
          // Then clean and validate all URLs
          response.data.profile_data = cleanProfileUrls(response.data.profile_data);
        }
        
        return response.data;
      } catch (error) {
        console.error(`Failed to fetch candidate profile ${candidateId}:`, error);
        throw error;
      }
    },
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

// Update Candidate Profile
export function useUpdateCandidateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { candidateId: string; profileData: any }) => {
      try {
        // Clean and validate URLs before sending to backend
        const cleanedProfileData = cleanProfileUrls(data.profileData);
        
        const response = await apiClient.put(ENDPOINTS.candidateProfile(data.candidateId), cleanedProfileData);
        return response.data;
      } catch (error) {
        console.error(`Failed to update candidate profile ${data.candidateId}:`, error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch candidate-related queries
      queryClient.invalidateQueries({ queryKey: candidateKeys.detail(variables.candidateId) });
      queryClient.invalidateQueries({ queryKey: candidateKeys.profile(variables.candidateId) });
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: candidateKeys.stats() });
      
      toast.success('Candidate profile updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to update candidate profile';
      toast.error(message);
    },
  });
}

// Get Candidate Documents
export function useCandidateDocuments(candidateId: string) {
  return useQuery({
    queryKey: candidateKeys.documents(candidateId),
    queryFn: async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.candidateDocuments(candidateId));
        return response.data;
      } catch (error) {
        console.error(`Failed to fetch candidate documents ${candidateId}:`, error);
        throw error;
      }
    },
    enabled: !!candidateId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

// Reprocess Candidate
export function useReprocessCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidateId: string) => {
      try {
        const response = await apiClient.get(ENDPOINTS.reprocessCandidate(candidateId));
        return response.data;
      } catch (error) {
        console.error(`Failed to reprocess candidate ${candidateId}:`, error);
        throw error;
      }
    },
    onSuccess: (data, candidateId) => {
      // Invalidate candidate-related queries
      queryClient.invalidateQueries({ queryKey: candidateKeys.detail(candidateId) });
      queryClient.invalidateQueries({ queryKey: candidateKeys.profile(candidateId) });
      queryClient.invalidateQueries({ queryKey: candidateKeys.processing() });
      
      toast.success('Candidate reprocessing started successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to start candidate reprocessing';
      toast.error(message);
    },
  });
}

// Get Processing Status
export function useProcessingStatus() {
  return useQuery({
    queryKey: candidateKeys.processing(),
    queryFn: async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.processingStatus);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch processing status:', error);
        throw error;
      }
    },
    staleTime: 1000 * 30, // 30 seconds - more frequent updates for processing status
    refetchInterval: 1000 * 30, // Auto-refetch every 30 seconds
    retry: 1,
  });
}

// Get Health Status
export function useCandidatesHealth() {
  return useQuery({
    queryKey: candidateKeys.health(),
    queryFn: async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.health);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch candidates health:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

// Get Processing Health
export function useProcessingHealth() {
  return useQuery({
    queryKey: [...candidateKeys.health(), 'processing'],
    queryFn: async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.healthProcessing);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch processing health:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });
}