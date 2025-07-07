/**
 * Enhanced Jobs Hook with Real-time Updates
 * Improved error handling and optimistic updates
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

import { jobsApi } from '@/lib/api/jobs';
import {
  JobCreateRequest,
  JobResponse,
  JobFilters,
  JobStatus,
} from '@/types/api';

// Query keys
export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters: JobFilters | undefined) => [...jobKeys.lists(), filters] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
  descriptions: (jobId: string) => [...jobKeys.detail(jobId), 'descriptions'] as const,
  description: (jobId: string, jdId: string) => [...jobKeys.descriptions(jobId), jdId] as const,
  analytics: () => [...jobKeys.all, 'analytics'] as const,
} as const;

// Enhanced jobs list hook with real-time updates
export function useJobs(filters?: JobFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: () => jobsApi.listJobs(filters),
    enabled,
    staleTime: 30000, // 30 seconds - more frequent updates for real-time feel
    refetchInterval: 300000, // 5 minutes background refresh
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if ((error as { response?: { status?: number } })?.response?.status === 401) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Enhanced job creation with optimistic updates
export function useCreateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: JobCreateRequest) => jobsApi.createJob(data),
    onMutate: async (newJob) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: jobKeys.lists() });
      
      // Snapshot the previous value
      const previousJobs = queryClient.getQueryData(jobKeys.lists());
      
      // Optimistically update to the new value
      queryClient.setQueryData(jobKeys.lists(), (old: JobResponse[] | undefined) => {
        if (!old) return [];
        
        const optimisticJob: JobResponse = {
          id: `temp-${Date.now()}`,
          title: newJob.title,
          description: newJob.description,
          department: newJob.department,
          location: newJob.location,
          job_type: newJob.job_type,
          job_mode: newJob.job_mode,
          seniority_level: newJob.seniority_level,
          salary_min: newJob.salary_min,
          salary_max: newJob.salary_max,
          salary_currency: newJob.salary_currency || 'USD',
          status: JobStatus.DRAFT,
          is_active: true,
          organization_id: 'temp-org',
          created_by_id: 'temp-user',
          job_metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        return [optimisticJob, ...old];
      });
      
      return { previousJobs };
    },
    onError: (error, _newJob, context) => {
      // Rollback on error
      if (context?.previousJobs) {
        queryClient.setQueryData(jobKeys.lists(), context.previousJobs);
      }
      
      toast.error('Failed to create job. Please try again.');
      console.error('Job creation error:', error);
    },
    onSuccess: (_data) => {
      // Invalidate and refetch jobs list
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.analytics() });
      
      toast.success('Job created successfully!');
    },
  });
}

// Enhanced job update with optimistic updates
export function useUpdateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: Partial<JobCreateRequest> }) =>
      jobsApi.updateJob(jobId, data),
    onMutate: async ({ jobId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: jobKeys.detail(jobId) });
      await queryClient.cancelQueries({ queryKey: jobKeys.lists() });
      
      // Snapshot the previous values
      const previousJob = queryClient.getQueryData(jobKeys.detail(jobId));
      const previousJobs = queryClient.getQueryData(jobKeys.lists());
      
      // Optimistically update job detail
      queryClient.setQueryData(jobKeys.detail(jobId), (old: JobResponse | undefined) => {
        if (!old) return old;
        return { ...old, updated_at: new Date().toISOString() };
      });
      
      // Optimistically update jobs list
      queryClient.setQueryData(jobKeys.lists(), (old: JobResponse[] | undefined) => {
        if (!old) return old;
        return old.map(job => 
          job.id === jobId 
            ? { ...job, updated_at: new Date().toISOString() }
            : job
        );
      });
      
      return { previousJob, previousJobs };
    },
    onError: (error, { jobId }, context) => {
      // Rollback on error
      if (context?.previousJob) {
        queryClient.setQueryData(jobKeys.detail(jobId), context.previousJob);
      }
      if (context?.previousJobs) {
        queryClient.setQueryData(jobKeys.lists(), context.previousJobs);
      }
      
      toast.error('Failed to update job. Please try again.');
      console.error('Job update error:', error);
    },
    onSuccess: (_data, { jobId }) => {
      // Update cache with server response
      queryClient.setQueryData(jobKeys.detail(jobId), _data);
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.analytics() });
      
      toast.success('Job updated successfully!');
    },
  });
}

// Enhanced job deletion with optimistic updates
export function useDeleteJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (jobId: string) => jobsApi.deleteJob(jobId),
    onMutate: async (jobId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: jobKeys.lists() });
      
      // Snapshot the previous value
      const previousJobs = queryClient.getQueryData(jobKeys.lists());
      
      // Optimistically remove from cache
      queryClient.setQueryData(jobKeys.lists(), (old: JobResponse[] | undefined) => {
        if (!old) return old;
        return old.filter(job => job.id !== jobId);
      });
      
      return { previousJobs };
    },
    onError: (error, jobId, context) => {
      // Rollback on error
      if (context?.previousJobs) {
        queryClient.setQueryData(jobKeys.lists(), context.previousJobs);
      }
      
      toast.error('Failed to delete job. Please try again.');
      console.error('Job deletion error:', error);
    },
    onSuccess: (_data, jobId) => {
      // Remove from all caches
      queryClient.removeQueries({ queryKey: jobKeys.detail(jobId) });
      queryClient.removeQueries({ queryKey: jobKeys.descriptions(jobId) });
      queryClient.invalidateQueries({ queryKey: jobKeys.analytics() });
      
      toast.success('Job deleted successfully!');
    },
  });
}

// Batch operations hook
export function useBatchJobOperations() {
  const queryClient = useQueryClient();
  
  const batchUpdateStatus = useMutation({
    mutationFn: async ({ jobIds }: { jobIds: string[] }) => {
      const promises = jobIds.map(id => jobsApi.updateJob(id, {} as JobCreateRequest)); // TODO: Extend API to support status updates
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.analytics() });
      toast.success('Jobs updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update jobs. Please try again.');
      console.error('Batch update error:', error);
    },
  });
  
  const batchDelete = useMutation({
    mutationFn: async (jobIds: string[]) => {
      const promises = jobIds.map(id => jobsApi.deleteJob(id));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.analytics() });
      toast.success('Jobs deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete jobs. Please try again.');
      console.error('Batch delete error:', error);
    },
  });
  
  return {
    batchUpdateStatus,
    batchDelete,
  };
}

// Hook for invalidating jobs data (useful for real-time updates)
export function useInvalidateJobs() {
  const queryClient = useQueryClient();
  
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: jobKeys.all });
  }, [queryClient]);
}
