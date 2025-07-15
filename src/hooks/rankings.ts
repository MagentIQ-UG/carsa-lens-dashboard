/**
 * Rankings Hook
 * Hooks for candidate ranking and shortlist management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { rankingsApi } from '@/lib/api';
import {
  RankingCreateRequest,
  RankingFilters,
  ShortlistCreateRequest,
} from '@/types/api';

// Query keys
export const rankingKeys = {
  all: ['rankings'] as const,
  lists: () => [...rankingKeys.all, 'list'] as const,
  list: (filters: RankingFilters) => [...rankingKeys.lists(), { filters }] as const,
  details: () => [...rankingKeys.all, 'detail'] as const,
  detail: (id: string) => [...rankingKeys.details(), id] as const,
  jobRankings: (jobId: string) => [...rankingKeys.all, 'job', jobId] as const,
  shortlists: () => [...rankingKeys.all, 'shortlists'] as const,
  analytics: (id: string) => [...rankingKeys.all, 'analytics', id] as const,
};

// List rankings
export function useRankings(filters?: RankingFilters) {
  return useQuery({
    queryKey: rankingKeys.list(filters || {}),
    queryFn: () => rankingsApi.listRankings(filters),
    staleTime: 30000, // 30 seconds
  });
}

// Get single ranking
export function useRanking(rankingId: string) {
  return useQuery({
    queryKey: rankingKeys.detail(rankingId),
    queryFn: () => rankingsApi.getRanking(rankingId),
    enabled: !!rankingId,
    staleTime: 60000, // 1 minute
  });
}

// Get job rankings
export function useJobRankings(jobId: string, params?: {
  limit?: number;
  offset?: number;
  sort_by?: string;
  order?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: rankingKeys.jobRankings(jobId),
    queryFn: () => rankingsApi.getJobRankings(jobId, params),
    enabled: !!jobId,
    staleTime: 30000, // 30 seconds
  });
}

// Get shortlists
export function useShortlists(params?: {
  job_id?: string;
  status?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: rankingKeys.shortlists(),
    queryFn: () => rankingsApi.getShortlists(params),
    staleTime: 30000, // 30 seconds
  });
}

// Create ranking
export function useCreateRanking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RankingCreateRequest) => rankingsApi.createRanking(data),
    onSuccess: (newRanking) => {
      // Invalidate rankings lists
      queryClient.invalidateQueries({ queryKey: rankingKeys.lists() });
      
      // Add to job rankings if job_id exists
      if (newRanking.job_id) {
        queryClient.invalidateQueries({ 
          queryKey: rankingKeys.jobRankings(newRanking.job_id) 
        });
      }
      
      toast.success('Ranking created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to create ranking';
      toast.error(message);
    },
  });
}

// Update ranking
export function useUpdateRanking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      rankingId, 
      data 
    }: { 
      rankingId: string; 
      data: Partial<RankingCreateRequest> 
    }) => rankingsApi.updateRanking(rankingId, data),
    onSuccess: (updatedRanking, { rankingId }) => {
      // Update the ranking in cache
      queryClient.setQueryData(
        rankingKeys.detail(rankingId),
        updatedRanking
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: rankingKeys.lists() });
      
      if (updatedRanking.job_id) {
        queryClient.invalidateQueries({ 
          queryKey: rankingKeys.jobRankings(updatedRanking.job_id) 
        });
      }
      
      toast.success('Ranking updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to update ranking';
      toast.error(message);
    },
  });
}

// Delete ranking
export function useDeleteRanking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rankingId: string) => rankingsApi.deleteRanking(rankingId),
    onSuccess: (_, rankingId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: rankingKeys.detail(rankingId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: rankingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: rankingKeys.shortlists() });
      
      toast.success('Ranking deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to delete ranking';
      toast.error(message);
    },
  });
}

// Create shortlist
export function useCreateShortlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ShortlistCreateRequest) => rankingsApi.createShortlist(data),
    onSuccess: () => {
      // Invalidate shortlists
      queryClient.invalidateQueries({ queryKey: rankingKeys.shortlists() });
      
      toast.success('Shortlist created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to create shortlist';
      toast.error(message);
    },
  });
}

// Get ranking analytics
export function useRankingAnalytics(rankingId: string) {
  return useQuery({
    queryKey: rankingKeys.analytics(rankingId),
    queryFn: () => rankingsApi.getRankingAnalytics(rankingId),
    enabled: !!rankingId,
    staleTime: 300000, // 5 minutes
  });
}

// Compare rankings
export function useCompareRankings() {
  return useMutation({
    mutationFn: ({ 
      rankingId, 
      compareWith 
    }: { 
      rankingId: string; 
      compareWith: string[] 
    }) => rankingsApi.compareRankings(rankingId, compareWith),
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to compare rankings';
      toast.error(message);
    },
  });
}

// Get diversity report
export function useDiversityReport(rankingId: string) {
  return useQuery({
    queryKey: [...rankingKeys.analytics(rankingId), 'diversity'],
    queryFn: () => rankingsApi.getDiversityReport(rankingId),
    enabled: !!rankingId,
    staleTime: 300000, // 5 minutes
  });
}