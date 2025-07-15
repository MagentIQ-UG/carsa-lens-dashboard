/**
 * Enhanced Candidates Hooks
 * Comprehensive hooks for candidate management using all available endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { candidatesApi } from '@/lib/api';
import {
  CandidateFilters,
  CandidateProfileData,
} from '@/types/api';

// Query keys
export const candidateKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  list: (filters: CandidateFilters) => [...candidateKeys.lists(), { filters }] as const,
  details: () => [...candidateKeys.all, 'detail'] as const,
  detail: (id: string) => [...candidateKeys.details(), id] as const,
  profile: (id: string) => [...candidateKeys.detail(id), 'profile'] as const,
  documents: (id: string) => [...candidateKeys.detail(id), 'documents'] as const,
  processing: () => [...candidateKeys.all, 'processing'] as const,
  health: () => [...candidateKeys.all, 'health'] as const,
};

// Enhanced candidates list with comprehensive filtering
export function useEnhancedCandidates(filters?: CandidateFilters) {
  return useQuery({
    queryKey: candidateKeys.list(filters || {}),
    queryFn: () => candidatesApi.listCandidates(filters),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute for real-time updates
  });
}

// Get single candidate with enhanced details
export function useEnhancedCandidate(candidateId: string) {
  return useQuery({
    queryKey: candidateKeys.detail(candidateId),
    queryFn: () => candidatesApi.getCandidate(candidateId),
    enabled: !!candidateId,
    staleTime: 60000, // 1 minute
  });
}

// Get candidate profile with extracted data
export function useCandidateProfile(candidateId: string) {
  return useQuery({
    queryKey: candidateKeys.profile(candidateId),
    queryFn: () => candidatesApi.getCandidateProfile(candidateId),
    enabled: !!candidateId,
    staleTime: 300000, // 5 minutes (profile data doesn't change often)
  });
}

// Get candidate documents
export function useCandidateDocuments(candidateId: string) {
  return useQuery({
    queryKey: candidateKeys.documents(candidateId),
    queryFn: () => candidatesApi.listCandidateDocuments(candidateId),
    enabled: !!candidateId,
    staleTime: 60000, // 1 minute
  });
}

// Get processing status for all candidates
export function useProcessingStatus(params?: {
  job_id?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  limit?: number;
}) {
  return useQuery({
    queryKey: [...candidateKeys.processing(), params],
    queryFn: () => candidatesApi.getProcessingStatus(params),
    staleTime: 10000, // 10 seconds for real-time processing updates
    refetchInterval: 15000, // 15 seconds
  });
}

// Enhanced CV upload with progress tracking
export function useUploadCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      file, 
      extractProfile = true, 
      onProgress 
    }: { 
      file: File; 
      extractProfile?: boolean; 
      onProgress?: (progress: number) => void 
    }) => candidatesApi.uploadCV(file, extractProfile, onProgress),
    onSuccess: (result) => {
      // Invalidate candidates list
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      
      // Invalidate processing status
      queryClient.invalidateQueries({ queryKey: candidateKeys.processing() });
      
      toast.success(`CV uploaded successfully${result.candidate?.id ? ` - Candidate ${result.candidate.id}` : ''}`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to upload CV';
      toast.error(message);
    },
  });
}

// Enhanced batch CV upload
export function useBatchUploadCVs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      files, 
      extractProfile = true, 
      onProgress 
    }: { 
      files: File[]; 
      extractProfile?: boolean; 
      onProgress?: (progress: number) => void 
    }) => candidatesApi.batchUploadCVs(files, extractProfile, onProgress),
    onSuccess: (result) => {
      // Invalidate candidates list
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      
      // Invalidate processing status
      queryClient.invalidateQueries({ queryKey: candidateKeys.processing() });
      
      const successCount = result.summary?.successful || 0;
      const failedCount = result.summary?.failed || 0;
      
      if (successCount > 0) {
        toast.success(`${successCount} CV${successCount > 1 ? 's' : ''} uploaded successfully`);
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} CV${failedCount > 1 ? 's' : ''} failed to upload`);
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to upload CVs';
      toast.error(message);
    },
  });
}

// Update candidate profile
export function useUpdateCandidateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      candidateId, 
      profileUpdates 
    }: { 
      candidateId: string; 
      profileUpdates: Partial<CandidateProfileData> 
    }) => candidatesApi.updateCandidateProfile(candidateId, profileUpdates),
    onSuccess: (result, { candidateId }) => {
      // Update the candidate in cache
      queryClient.setQueryData(
        candidateKeys.detail(candidateId),
        result.candidate
      );
      
      // Invalidate profile to get fresh data
      queryClient.invalidateQueries({ 
        queryKey: candidateKeys.profile(candidateId) 
      });
      
      // Invalidate candidates list
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
      
      toast.success('Candidate profile updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to update candidate profile';
      toast.error(message);
    },
  });
}

// Reprocess candidate
export function useReprocessCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      candidateId, 
      extractProfile = true 
    }: { 
      candidateId: string; 
      extractProfile?: boolean 
    }) => candidatesApi.reprocessCandidate(candidateId, extractProfile),
    onSuccess: (result, { candidateId }) => {
      // Invalidate candidate data to get fresh results
      queryClient.invalidateQueries({ 
        queryKey: candidateKeys.detail(candidateId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: candidateKeys.profile(candidateId) 
      });
      
      // Invalidate processing status
      queryClient.invalidateQueries({ queryKey: candidateKeys.processing() });
      
      toast.success(`Candidate reprocessing started - ID: ${result.processing_id}`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to reprocess candidate';
      toast.error(message);
    },
  });
}

// Get processing health
export function useProcessingHealth() {
  return useQuery({
    queryKey: [...candidateKeys.health(), 'processing'],
    queryFn: () => candidatesApi.checkProcessingHealth(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });
}

// Get general health
export function useCandidatesHealth() {
  return useQuery({
    queryKey: candidateKeys.health(),
    queryFn: () => candidatesApi.checkGeneralHealth(),
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
  });
}

// Combined hook for candidate management dashboard
export function useCandidatesDashboard(filters?: CandidateFilters) {
  const candidates = useEnhancedCandidates(filters);
  const processingStatus = useProcessingStatus();
  const health = useProcessingHealth();

  return {
    candidates,
    processingStatus,
    health,
    isLoading: candidates.isLoading || processingStatus.isLoading || health.isLoading,
    error: candidates.error || processingStatus.error || health.error,
  };
}

// Hook for candidate statistics
export function useCandidateStats() {
  const { data: candidates } = useEnhancedCandidates();
  const { data: processingStatus } = useProcessingStatus();

  const stats = {
    total: candidates?.length || 0,
    processing: processingStatus?.processing_jobs?.filter(job => job.status === 'processing').length || 0,
    completed: processingStatus?.processing_jobs?.filter(job => job.status === 'completed').length || 0,
    failed: processingStatus?.processing_jobs?.filter(job => job.status === 'failed').length || 0,
    pending: processingStatus?.processing_jobs?.filter(job => job.status === 'pending').length || 0,
  };

  return {
    stats,
    isLoading: !candidates || !processingStatus,
  };
}