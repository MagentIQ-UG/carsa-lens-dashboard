/**
 * Advanced Analytics Hooks
 * Hooks for detailed analytics, reporting, and insights
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { analyticsApi } from '@/lib/api';
import {
  ReportGenerationRequest,
  InsightGenerationRequest,
  MetricRecordRequest,
  EventTrackingRequest,
} from '@/types/api';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: () => [...analyticsKeys.all, 'overview'] as const,
  reports: () => [...analyticsKeys.all, 'reports'] as const,
  report: (id: string) => [...analyticsKeys.reports(), id] as const,
  insights: () => [...analyticsKeys.all, 'insights'] as const,
  jobInsights: (jobId: string) => [...analyticsKeys.insights(), 'job', jobId] as const,
  usage: (period?: string) => [...analyticsKeys.all, 'usage', period] as const,
};

// Get analytics reports
export function useAnalyticsReports(params?: {
  type?: string;
  date_range?: string;
  job_id?: string;
}) {
  return useQuery({
    queryKey: [...analyticsKeys.reports(), params],
    queryFn: () => analyticsApi.getReports(params),
    staleTime: 300000, // 5 minutes
  });
}

// Get single report
export function useAnalyticsReport(reportId: string) {
  return useQuery({
    queryKey: analyticsKeys.report(reportId),
    queryFn: () => analyticsApi.getReport(reportId),
    enabled: !!reportId,
    staleTime: 300000, // 5 minutes
  });
}

// Generate report
export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReportGenerationRequest) => analyticsApi.generateReport(data),
    onSuccess: () => {
      // Invalidate reports list
      queryClient.invalidateQueries({ queryKey: analyticsKeys.reports() });
      toast.success('Report generated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to generate report';
      toast.error(message);
    },
  });
}

// Get insights
export function useAnalyticsInsights(params?: {
  type?: string;
  limit?: number;
  dismissed?: boolean;
}) {
  return useQuery({
    queryKey: [...analyticsKeys.insights(), params],
    queryFn: () => analyticsApi.getInsights(params),
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
  });
}

// Get job-specific insights
export function useJobInsights(jobId: string) {
  return useQuery({
    queryKey: analyticsKeys.jobInsights(jobId),
    queryFn: () => analyticsApi.getJobInsights(jobId),
    enabled: !!jobId,
    staleTime: 60000, // 1 minute
  });
}

// Generate insights
export function useGenerateInsights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InsightGenerationRequest) => analyticsApi.generateInsights(data),
    onSuccess: () => {
      // Invalidate insights
      queryClient.invalidateQueries({ queryKey: analyticsKeys.insights() });
      toast.success('Insights generated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to generate insights';
      toast.error(message);
    },
  });
}

// Dismiss insight
export function useDismissInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (insightId: string) => analyticsApi.dismissInsight(insightId),
    onSuccess: () => {
      // Invalidate insights to remove dismissed ones
      queryClient.invalidateQueries({ queryKey: analyticsKeys.insights() });
      toast.success('Insight dismissed');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to dismiss insight';
      toast.error(message);
    },
  });
}

// Get usage analytics
export function useAnalyticsUsage(params?: {
  period?: string;
  feature?: string;
  user_id?: string;
}) {
  return useQuery({
    queryKey: analyticsKeys.usage(params?.period),
    queryFn: () => analyticsApi.getUsage(params),
    staleTime: 300000, // 5 minutes
  });
}

// Record metric
export function useRecordMetric() {
  return useMutation({
    mutationFn: (data: MetricRecordRequest) => analyticsApi.recordMetric(data),
    onError: (error: any) => {
      console.error('Failed to record metric:', error);
      // Don't show toast for metric recording failures
    },
  });
}

// Track event
export function useTrackEvent() {
  return useMutation({
    mutationFn: (data: EventTrackingRequest) => analyticsApi.trackEvent(data),
    onError: (error: any) => {
      console.error('Failed to track event:', error);
      // Don't show toast for event tracking failures
    },
  });
}

// Combined hook for dashboard analytics with enhanced features
export function useAdvancedAnalytics() {
  const overview = useQuery({
    queryKey: analyticsKeys.overview(),
    queryFn: () => analyticsApi.getOverview(),
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
  });

  const insights = useAnalyticsInsights({ limit: 5, dismissed: false });
  const usage = useAnalyticsUsage({ period: '7d' });

  return {
    overview,
    insights,
    usage,
    isLoading: overview.isLoading || insights.isLoading || usage.isLoading,
    error: overview.error || insights.error || usage.error,
  };
}

// Hook for real-time analytics tracking
export function useAnalyticsTracking() {
  const recordMetric = useRecordMetric();
  const trackEvent = useTrackEvent();

  const trackPageView = (page: string) => {
    trackEvent.mutate({
      event_type: 'page_view',
      event_data: { page },
      timestamp: new Date().toISOString(),
    });
  };

  const trackUserAction = (action: string, details?: any) => {
    trackEvent.mutate({
      event_type: 'user_action',
      event_data: { action, details },
      timestamp: new Date().toISOString(),
    });
  };

  const recordPerformanceMetric = (metric: string, value: number) => {
    recordMetric.mutate({
      metric_name: metric,
      metric_value: value,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackPageView,
    trackUserAction,
    recordPerformanceMetric,
  };
}