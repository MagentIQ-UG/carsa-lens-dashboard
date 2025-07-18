/**
 * Evaluation Hooks
 * Comprehensive hooks for AI-powered candidate evaluation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useState, useCallback, useRef, useEffect } from 'react';
import { evaluationsApi } from '@/lib/api';
import {
  EvaluateRequest,
  BatchEvaluateRequest,
  EvaluationResponse,
  BatchEvaluationResponse,
  EvaluationFilters,
  EvaluationProgress,
  EvaluationSession,
  EvaluationComparison,
  BaseResponse,
} from '@/types/api';

// Query keys
export const evaluationKeys = {
  all: ['evaluations'] as const,
  lists: () => [...evaluationKeys.all, 'list'] as const,
  list: (filters: EvaluationFilters) => [...evaluationKeys.lists(), { filters }] as const,
  details: () => [...evaluationKeys.all, 'detail'] as const,
  detail: (id: string) => [...evaluationKeys.details(), id] as const,
  sessions: () => [...evaluationKeys.all, 'sessions'] as const,
  session: (id: string) => [...evaluationKeys.sessions(), id] as const,
  comparisons: () => [...evaluationKeys.all, 'comparisons'] as const,
  jobSummary: (jobId: string) => [...evaluationKeys.all, 'summary', jobId] as const,
};

// List evaluations with filtering
export function useEvaluations(filters?: EvaluationFilters) {
  return useQuery({
    queryKey: evaluationKeys.list(filters || {}),
    queryFn: async () => {
      // Temporary: Return empty array to test auth without API calls
      // TODO: Remove this mock when API is fixed
      if (process.env.NEXT_PUBLIC_MOCK_EVALUATIONS === 'true') {
        return [];
      }
      try {
        const response = await evaluationsApi.listEvaluations(filters);
        // Extract the items array from the paginated response
        return response.data?.items || [];
      } catch (error: any) {
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Get single evaluation
export function useEvaluation(evaluationId: string) {
  return useQuery({
    queryKey: evaluationKeys.detail(evaluationId),
    queryFn: () => evaluationsApi.getEvaluation(evaluationId),
    enabled: !!evaluationId,
    staleTime: 60000, // 1 minute
  });
}

// Get evaluation summary for a job
export function useEvaluationSummary(jobId: string) {
  return useQuery({
    queryKey: evaluationKeys.jobSummary(jobId),
    queryFn: () => evaluationsApi.getEvaluationSummary(jobId),
    enabled: !!jobId,
    staleTime: 60000, // 1 minute
  });
}

// Single candidate evaluation
export function useEvaluateCandidate() {
  const queryClient = useQueryClient();

  return useMutation<BaseResponse<EvaluationResponse>, Error, EvaluateRequest>({
    mutationFn: evaluationsApi.evaluateCandidate,
    onSuccess: (data, variables) => {
      toast.success('Candidate evaluation completed successfully');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: evaluationKeys.all });
      queryClient.invalidateQueries({ queryKey: evaluationKeys.jobSummary(variables.job_id) });
      
      // Update cached evaluation
      if (data.data) {
        queryClient.setQueryData(
          evaluationKeys.detail(data.data.evaluation_id),
          data
        );
      }
    },
    onError: (error) => {
      console.error('Evaluation failed:', error);
      toast.error(`Evaluation failed: ${error.message}`);
    },
  });
}

// Batch evaluation with progress tracking
export function useBatchEvaluate() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<EvaluationProgress[]>([]);
  const [session, setSession] = useState<EvaluationSession | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const clearProgress = useCallback(() => {
    setProgress([]);
    setSession(null);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  }, []);

  const mutation = useMutation<BaseResponse<BatchEvaluationResponse>, Error, BatchEvaluateRequest>({
    mutationFn: async (data) => {
      // Initialize session
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newSession: EvaluationSession = {
        session_id: sessionId,
        job_id: data.job_id,
        candidate_ids: data.candidate_ids,
        status: 'active',
        progress: data.candidate_ids.map(id => ({
          evaluation_id: `eval_${id}_${Date.now()}`,
          candidate_id: id,
          status: 'pending',
          progress_percentage: 0,
          stage: 'Queued',
          started_at: new Date().toISOString(),
        })),
        total_candidates: data.candidate_ids.length,
        completed_count: 0,
        failed_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setSession(newSession);
      setProgress(newSession.progress);

      // Start progress simulation (replace with real WebSocket in production)
      progressInterval.current = setInterval(() => {
        setProgress(current => {
          const updated = current.map(p => {
            if (p.status === 'pending') {
              return { 
                ...p, 
                status: 'processing' as const, 
                stage: 'Analyzing CV', 
                progress_percentage: 25 
              };
            }
            if (p.status === 'processing' && p.progress_percentage < 100) {
              const newProgress = Math.min(100, p.progress_percentage + Math.random() * 20);
              if (newProgress >= 100) {
                return {
                  ...p,
                  status: 'completed' as const,
                  progress_percentage: 100,
                  stage: 'Evaluation Complete',
                  completed_at: new Date().toISOString(),
                };
              }
              return { ...p, progress_percentage: newProgress, stage: 'Evaluating Criteria' };
            }
            return p;
          });

          const completedCount = updated.filter(p => p.status === 'completed').length;
          const failedCount = updated.filter(p => p.status === 'failed').length;
          
          if (completedCount + failedCount === updated.length) {
            setSession(prev => prev ? {
              ...prev,
              status: 'completed',
              completed_count: completedCount,
              failed_count: failedCount,
              updated_at: new Date().toISOString(),
            } : null);
            
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
          }

          return updated;
        });
      }, 1000);

      return evaluationsApi.batchEvaluate(data);
    },
    onSuccess: (data, variables) => {
      toast.success(
        `Batch evaluation completed: ${data.data?.successful_evaluations || 0} successful, ${data.data?.failed_evaluations || 0} failed`
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: evaluationKeys.all });
      queryClient.invalidateQueries({ queryKey: evaluationKeys.jobSummary(variables.job_id) });
    },
    onError: (error) => {
      console.error('Batch evaluation failed:', error);
      toast.error(`Batch evaluation failed: ${error.message}`);
      
      // Update progress to show failures
      setProgress(current => 
        current.map(p => 
          p.status === 'processing' || p.status === 'pending'
            ? { ...p, status: 'failed', error_message: error.message }
            : p
        )
      );
      
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  return {
    ...mutation,
    progress,
    session,
    clearProgress,
  };
}

// Re-evaluate candidate
export function useReEvaluate() {
  const queryClient = useQueryClient();

  return useMutation<BaseResponse<EvaluationResponse>, Error, { evaluationId: string; customInstructions?: string }>({
    mutationFn: ({ evaluationId, customInstructions }) =>
      evaluationsApi.reEvaluateCandidate(evaluationId, customInstructions),
    onSuccess: (data, _variables) => {
      toast.success('Re-evaluation completed successfully');
      
      // Invalidate and update cache
      queryClient.invalidateQueries({ queryKey: evaluationKeys.all });
      if (data.data) {
        queryClient.setQueryData(
          evaluationKeys.detail(data.data.evaluation_id),
          data
        );
      }
    },
    onError: (error) => {
      console.error('Re-evaluation failed:', error);
      toast.error(`Re-evaluation failed: ${error.message}`);
    },
  });
}

// Evaluation comparison
export function useEvaluationComparison() {
  const [comparison, setComparison] = useState<EvaluationComparison | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const compareEvaluations = useCallback(async (
    candidateIds: string[],
    jobId: string
  ) => {
    if (candidateIds.length < 2) {
      toast.error('Select at least 2 candidates for comparison');
      return;
    }

    setIsLoading(true);
    try {
      // Fetch all evaluations for the candidates
      const evaluationPromises = candidateIds.map(async (candidateId) => {
        const filters: EvaluationFilters = { candidate_id: candidateId, job_id: jobId };
        const response = await evaluationsApi.listEvaluations(filters);
        const evaluationList = response.data?.items?.[0]; // Get the most recent evaluation from paginated response
        
        // If we found an evaluation, get the full details
        if (evaluationList?.evaluation_id) {
          const detailResponse = await evaluationsApi.getEvaluation(evaluationList.evaluation_id);
          return detailResponse.data;
        }
        return null;
      });

      const evaluations = await Promise.all(evaluationPromises);
      const validEvaluations = evaluations.filter((evaluation): evaluation is NonNullable<typeof evaluation> => evaluation != null);
      
      // Build comparison data
      const comparisonData: EvaluationComparison = {
        candidate_ids: candidateIds,
        job_id: jobId,
        evaluations: validEvaluations,
        comparison_matrix: [],
        strengths_comparison: validEvaluations.map((evaluation) => ({
          candidate_id: evaluation.candidate_id,
          strengths: evaluation.strengths || [],
        })),
        gaps_comparison: validEvaluations.map((evaluation) => ({
          candidate_id: evaluation.candidate_id,
          gaps: evaluation.gaps || [],
        })),
        recommendations: validEvaluations.map((evaluation) => ({
          candidate_id: evaluation.candidate_id,
          recommendation: evaluation.recommendations || '',
          reasoning: `Overall score: ${evaluation.overall_score || 0}%, Tier: ${evaluation.qualification_tier || 'Unknown'}`,
        })),
      };

      setComparison(comparisonData);
      toast.success(`Comparison generated for ${evaluations.length} candidates`);
    } catch (error) {
      console.error('Comparison failed:', error);
      toast.error('Failed to generate comparison');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearComparison = useCallback(() => {
    setComparison(null);
  }, []);

  return {
    comparison,
    isLoading,
    compareEvaluations,
    clearComparison,
  };
}

// Evaluation progress tracking hook
export function useEvaluationProgress(sessionId?: string) {
  return useQuery({
    queryKey: evaluationKeys.session(sessionId || ''),
    queryFn: async (): Promise<EvaluationSession | null> => {
      // In production, this would fetch from a real endpoint
      // For now, return null as we handle progress in the batch hook
      return null;
    },
    enabled: !!sessionId,
    refetchInterval: 2000, // Poll every 2 seconds
    staleTime: 0, // Always fresh
  });
}
