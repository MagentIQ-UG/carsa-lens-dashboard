/**
 * Job Management Hooks
 * TanStack Query hooks for job operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { jobsApi } from '@/lib/api/jobs';
import { apiClient } from '@/lib/api/client';
import {
  JobCreateRequest,
  JobResponse,
  JobFilters,
  JobDescriptionResponse,
  JDGenerationRequest,
  JDEnhancementRequest,
  JDUploadResponse,
  JDEnhancementResponse,
  ScorecardUpdateRequest,
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
} as const;

// Jobs list hook
export function useJobs(filters?: JobFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: () => jobsApi.listJobs(filters),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Single job hook
export function useJob(jobId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => jobsApi.getJob(jobId),
    enabled: enabled && !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Job descriptions hook
export function useJobDescriptions(jobId: string, includeHistory: boolean = false, enabled: boolean = true) {
  return useQuery({
    queryKey: jobKeys.descriptions(jobId),
    queryFn: () => jobsApi.listJobDescriptions(jobId, includeHistory),
    enabled: enabled && !!jobId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Single job description hook
export function useJobDescription(jobId: string, jdId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: jobKeys.description(jobId, jdId),
    queryFn: () => jobsApi.getJobDescription(jobId, jdId),
    enabled: enabled && !!jobId && !!jdId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create job mutation
export function useCreateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: JobCreateRequest) => jobsApi.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      toast.success('Job created successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create job';
      toast.error(message);
    },
  });
}

// Update job mutation
export function useUpdateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: Partial<JobCreateRequest> }) => 
      jobsApi.updateJob(jobId, data),
    onSuccess: (data: JobResponse) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      toast.success('Job updated successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update job';
      toast.error(message);
    },
  });
}

// Delete job mutation
export function useDeleteJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (jobId: string) => jobsApi.deleteJob(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.removeQueries({ queryKey: jobKeys.detail(jobId) });
      toast.success('Job deleted successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete job';
      toast.error(message);
    },
  });
}

// Upload job description mutation
export function useUploadJobDescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      jobId, 
      file, 
      onProgress 
    }: { 
      jobId: string; 
      file: File; 
      onProgress?: (progress: number) => void; 
    }) => 
      jobsApi.uploadJobDescription(jobId, file, onProgress),
    onSuccess: (data: JDUploadResponse) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.descriptions(data.job_description.job_id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(data.job_description.job_id) });
      toast.success('Job description uploaded successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to upload job description';
      toast.error(message);
    },
  });
}

// Generate job description mutation
export function useGenerateJobDescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      jobId, 
      data, 
      aiProvider 
    }: { 
      jobId: string; 
      data: JDGenerationRequest;
      aiProvider?: string;
    }) => 
      jobsApi.generateJobDescription(jobId, data, aiProvider),
    onSuccess: (data: JobDescriptionResponse) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.descriptions(data.job_id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(data.job_id) });
      toast.success('Job description generated successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to generate job description';
      toast.error(message);
    },
  });
}

// Enhance job description mutation
export function useEnhanceJobDescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      jobId, 
      jdId, 
      data, 
      aiProvider 
    }: { 
      jobId: string; 
      jdId: string;
      data: JDEnhancementRequest;
      aiProvider?: string;
    }) => 
      jobsApi.enhanceJobDescription(jobId, jdId, data, aiProvider),
    onSuccess: (data: JDEnhancementResponse) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.description(data.enhanced_description.job_id, data.enhanced_description.id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.descriptions(data.enhanced_description.job_id) });
      toast.success('Job description enhanced successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to enhance job description';
      toast.error(message);
    },
  });
}

// Generate scorecard mutation
export function useGenerateScorecard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      jobId, 
      jdId, 
      customInstructions 
    }: { 
      jobId: string; 
      jdId: string;
      customInstructions?: string;
    }) => 
      jobsApi.generateScorecard(jobId, jdId, customInstructions),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
      toast.success('Scorecard generated successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to generate scorecard';
      toast.error(message);
    },
  });
}

// List job scorecards hook
export function useJobScorecards(jobId: string, includeArchived: boolean = false, enabled: boolean = true) {
  return useQuery({
    queryKey: ['scorecards', jobId, includeArchived],
    queryFn: () => jobsApi.listJobScorecards(jobId, includeArchived),
    enabled: enabled && !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Single scorecard hook
export function useScorecard(scorecardId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['scorecard', scorecardId],
    queryFn: () => jobsApi.getScorecard(scorecardId),
    enabled: enabled && !!scorecardId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Update scorecard mutation
export function useUpdateScorecard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      scorecardId, 
      data 
    }: { 
      scorecardId: string;
      data: ScorecardUpdateRequest;
    }) => 
      jobsApi.updateScorecard(scorecardId, data),
    onSuccess: (_, { scorecardId }) => {
      queryClient.invalidateQueries({ queryKey: ['scorecard', scorecardId] });
      queryClient.invalidateQueries({ queryKey: ['scorecards'] });
      toast.success('Scorecard updated successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update scorecard';
      toast.error(message);
    },
  });
}

// Approve scorecard mutation
export function useApproveScorecard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      scorecardId, 
      action,
      comment
    }: { 
      scorecardId: string;
      action: 'approve' | 'reject' | 'request_changes';
      comment?: string;
    }) => 
      jobsApi.approveScorecard(scorecardId, action, comment),
    onSuccess: (_, { scorecardId }) => {
      queryClient.invalidateQueries({ queryKey: ['scorecard', scorecardId] });
      queryClient.invalidateQueries({ queryKey: ['scorecards'] });
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      toast.success('Scorecard approval updated successfully!');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update scorecard approval';
      toast.error(message);
    },
  });
}

// AI services health check
export function useAIServicesHealth() {
  return useQuery({
    queryKey: ['ai-services', 'health'],
    queryFn: () => jobsApi.checkAIServices(),
    staleTime: 30 * 1000, // 30 seconds
    retry: 3,
  });
}

// Job approval mutation
export function useApproveJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      jobId, 
      action, 
      comment 
    }: { 
      jobId: string; 
      action: 'approve' | 'reject' | 'request_changes';
      comment?: string;
    }) => 
      jobsApi.approveJob(jobId, action, comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(data.job.id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      const actionText = data.job.status === 'active' ? 'approved' : 'updated';
      toast.success(`Job ${actionText} successfully!`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update job approval';
      toast.error(message);
    },
  });
}



// Job Statistics Hook - get applications and candidates count for a job
export function useJobStats(jobId: string) {
  return useQuery({
    queryKey: [...jobKeys.detail(jobId), 'stats'],
    queryFn: async () => {
      // Get job statistics for the specified job
      
      try {
        // Use the existing analytics endpoint for job statistics
        const response = await apiClient.get(`/api/v1/analytics/jobs/${jobId}/insights`);
        
        // Extract relevant statistics from the analytics response
        const analytics = response.data;
        
        return {
          applications: analytics.funnel_metrics?.applications || analytics.event_statistics?.total_applications || 0,
          candidates: analytics.funnel_metrics?.candidates || analytics.funnel_metrics?.applications || 0,
          totalEvaluations: analytics.funnel_metrics?.evaluations || analytics.event_statistics?.completed_evaluations || 0,
          qualifiedCandidates: analytics.quality_metrics?.qualified_candidates || 0,
          highScoringCandidates: analytics.quality_metrics?.highly_qualified_candidates || 0,
        };
      } catch (error) {
        console.error('Failed to fetch job analytics, falling back to evaluations endpoint:', error);
        
        // Fallback: Try to get statistics from evaluations endpoint
        try {
          const response = await apiClient.get('/api/v1/evaluations', {
            params: {
              job_id: jobId,
              limit: 1000 // Get all evaluations for this job
            }
          });

          let evaluations: any[] = [];
          // Handle different response structures from the evaluations API
          if (response.data?.success && Array.isArray(response.data.data?.items)) {
            evaluations = response.data.data.items;
          } else if (Array.isArray(response.data?.data?.items)) {
            evaluations = response.data.data.items;
          } else if (Array.isArray(response.data?.items)) {
            evaluations = response.data.items;
          } else if (Array.isArray(response.data)) {
            evaluations = response.data;
          }

          // If no evaluations exist for this job, return zero counts
          if (!evaluations || evaluations.length === 0) {
            return {
              applications: 0,
              candidates: 0,
              totalEvaluations: 0,
              qualifiedCandidates: 0,
              highScoringCandidates: 0,
            };
          }

          // Calculate statistics from evaluations
          const totalEvaluations = evaluations.length;
          
          // Get unique candidates (applications) - each unique candidate_id represents an application
          const uniqueCandidateIds = new Set(evaluations.map(e => e.candidate_id));
          const applicationsCount = uniqueCandidateIds.size;
          
          // Candidates count is the same as applications count since each candidate represents one application
          const candidatesCount = applicationsCount;
          
          // Additional statistics based on evaluation data
          const qualifiedCandidates = evaluations.filter(e => 
            e.qualification_tier === 'highly_qualified' || e.qualification_tier === 'qualified'
          ).length;
          
          const highScoringCandidates = evaluations.filter(e => 
            e.overall_score && e.overall_score >= 0.7
          ).length;

          return {
            applications: applicationsCount,
            candidates: candidatesCount,
            totalEvaluations,
            qualifiedCandidates,
            highScoringCandidates,
          };
        } catch (fallbackError) {
          console.error('Failed to fetch job statistics from both endpoints:', fallbackError);
          // Return fallback data
          return {
            applications: 0,
            candidates: 0,
            totalEvaluations: 0,
            qualifiedCandidates: 0,
            highScoringCandidates: 0,
          };
        }
      }
    },
    enabled: !!jobId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });
}