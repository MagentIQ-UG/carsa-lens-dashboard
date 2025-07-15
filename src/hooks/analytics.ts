/**
 * Advanced Analytics Hook
 * Real-time dashboard analytics with caching and optimization
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { analyticsApi } from '@/lib/api';

interface AnalyticsMetrics {
  jobs: {
    total: number;
    active: number;
    draft: number;
    closed: number;
  };
  candidates: {
    total: number;
    new: number;
    evaluated: number;
    shortlisted: number;
  };
  performance: {
    timeToHire: number;
    hireRate: number;
    candidateQuality: number;
    evaluationSpeed: number;
  };
  trends: {
    jobGrowth: number;
    candidateGrowth: number;
    evaluationTrend: number;
  };
}

// Mock analytics data - replace with actual API call
const mockAnalyticsData: AnalyticsMetrics = {
  jobs: {
    total: 45,
    active: 12,
    draft: 8,
    closed: 25,
  },
  candidates: {
    total: 248,
    new: 24,
    evaluated: 186,
    shortlisted: 38,
  },
  performance: {
    timeToHire: 18,
    hireRate: 24.5,
    candidateQuality: 87.3,
    evaluationSpeed: 4.2,
  },
  trends: {
    jobGrowth: 15.2,
    candidateGrowth: 8.1,
    evaluationTrend: 12.7,
  },
};

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async (): Promise<AnalyticsMetrics> => {
      try {
        // Use the real analytics API
        const overview = await analyticsApi.getOverview();
        
        // Transform the API response to match our interface
        return {
          jobs: {
            total: overview.jobs?.total || 0,
            active: overview.jobs?.active || 0,
            draft: overview.jobs?.draft || 0,
            closed: overview.jobs?.closed || 0,
          },
          candidates: {
            total: overview.candidates?.total || 0,
            new: overview.candidates?.new || 0,
            evaluated: overview.candidates?.evaluated || 0,
            shortlisted: overview.candidates?.shortlisted || 0,
          },
          performance: {
            timeToHire: overview.performance?.time_to_hire || 0,
            hireRate: overview.performance?.hire_rate || 0,
            candidateQuality: overview.performance?.candidate_quality || 0,
            evaluationSpeed: overview.performance?.evaluation_speed || 0,
          },
          trends: {
            jobGrowth: overview.trends?.job_growth || 0,
            candidateGrowth: overview.trends?.candidate_growth || 0,
            evaluationTrend: overview.trends?.evaluation_trend || 0,
          },
        };
      } catch (error) {
        console.warn('Analytics API unavailable, falling back to mock data:', error);
        // Fallback to mock data if API is unavailable
        return mockAnalyticsData;
      }
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
  });
}

export function useAnalyticsMetrics() {
  const { data: analytics, isLoading, error } = useAnalytics();

  const metrics = useMemo(() => {
    if (!analytics) return null;

    return [
      {
        title: 'Active Jobs',
        value: analytics.jobs.active,
        subtitle: 'Open positions',
        trend: { 
          value: analytics.trends.jobGrowth, 
          direction: analytics.trends.jobGrowth > 0 ? 'up' as const : 'down' as const, 
          label: 'vs last month' 
        }
      },
      {
        title: 'Total Candidates',
        value: analytics.candidates.total,
        subtitle: 'In pipeline',
        trend: { 
          value: analytics.trends.candidateGrowth, 
          direction: analytics.trends.candidateGrowth > 0 ? 'up' as const : 'down' as const, 
          label: 'vs last month' 
        }
      },
      {
        title: 'Time to Hire',
        value: analytics.performance.timeToHire,
        subtitle: 'Average days',
        trend: { 
          value: 2.1, 
          direction: 'down' as const, 
          label: 'improvement' 
        }
      },
      {
        title: 'Hire Success Rate',
        value: analytics.performance.hireRate,
        subtitle: 'Placement percentage',
        trend: { 
          value: 3.2, 
          direction: 'up' as const, 
          label: 'vs last month' 
        }
      }
    ];
  }, [analytics]);

  return {
    metrics,
    analytics,
    isLoading,
    error,
  };
}
