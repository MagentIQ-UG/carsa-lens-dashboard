import { QueryClient } from '@tanstack/react-query';

import type { JobFilters, CandidateFilters, EvaluationFilters } from '@/types/api';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache time: 10 minutes  
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus in production
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      // Don't refetch on reconnect by default
      refetchOnReconnect: 'always',
      // Background refetch interval: 5 minutes
      refetchInterval: 5 * 60 * 1000,
    },
    mutations: {
      // Retry mutations on network errors
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for 5xx errors
        return failureCount < 3;
      },
      // Retry delay for mutations
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Query key factory for consistent key generation
export const queryKeys = {
  // Authentication
  auth: {
    me: () => ['auth', 'me'] as const,
    session: () => ['auth', 'session'] as const,
  },
  // Jobs
  jobs: {
    all: () => ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all(), 'list'] as const,
    list: (filters?: JobFilters) => [...queryKeys.jobs.lists(), { filters }] as const,
    details: () => [...queryKeys.jobs.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
    descriptions: (jobId: string) => [...queryKeys.jobs.detail(jobId), 'descriptions'] as const,
  },
  // Candidates
  candidates: {
    all: () => ['candidates'] as const,
    lists: () => [...queryKeys.candidates.all(), 'list'] as const,
    list: (filters?: CandidateFilters) => [...queryKeys.candidates.lists(), { filters }] as const,
    details: () => [...queryKeys.candidates.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.candidates.details(), id] as const,
    profile: (id: string) => [...queryKeys.candidates.detail(id), 'profile'] as const,
    documents: (id: string) => [...queryKeys.candidates.detail(id), 'documents'] as const,
  },
  // Evaluations
  evaluations: {
    all: () => ['evaluations'] as const,
    lists: () => [...queryKeys.evaluations.all(), 'list'] as const,
    list: (filters?: EvaluationFilters) => [...queryKeys.evaluations.lists(), { filters }] as const,
    details: () => [...queryKeys.evaluations.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.evaluations.details(), id] as const,
    summary: (jobId: string) => [...queryKeys.evaluations.all(), 'summary', jobId] as const,
  },
  // Rankings & Analytics
  rankings: {
    job: (jobId: string) => ['rankings', 'job', jobId] as const,
  },
  analytics: {
    dashboard: () => ['analytics', 'dashboard'] as const,
    metrics: (filters?: Record<string, unknown>) => ['analytics', 'metrics', { filters }] as const,
  },
} as const;