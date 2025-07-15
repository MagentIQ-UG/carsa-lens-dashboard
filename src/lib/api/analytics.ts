import {
  AnalyticsOverview,
  AnalyticsReport,
  AnalyticsInsight,
  AnalyticsUsage,
  ReportGenerationRequest,
  InsightGenerationRequest,
  MetricRecordRequest,
  EventTrackingRequest,
} from '@/types/api';

import { apiGet, apiPost } from './client';

// Analytics API endpoints
export const analyticsApi = {
  // Overview and main metrics
  getOverview: (): Promise<AnalyticsOverview> =>
    apiGet('/analytics/overview'),

  // Reports
  getReports: (params?: { 
    type?: string; 
    date_range?: string; 
    job_id?: string 
  }): Promise<AnalyticsReport[]> =>
    apiGet('/analytics/reports', { params }),

  generateReport: (data: ReportGenerationRequest): Promise<AnalyticsReport> =>
    apiPost('/analytics/reports/generate', data),

  getReport: (reportId: string): Promise<AnalyticsReport> =>
    apiGet(`/analytics/reports/${reportId}`),

  // Insights
  getInsights: (params?: { 
    type?: string; 
    limit?: number; 
    dismissed?: boolean 
  }): Promise<AnalyticsInsight[]> =>
    apiGet('/analytics/insights', { params }),

  generateInsights: (data: InsightGenerationRequest): Promise<AnalyticsInsight> =>
    apiPost('/analytics/insights/generate', data),

  dismissInsight: (insightId: string): Promise<{ message: string }> =>
    apiPost(`/analytics/insights/${insightId}/dismiss`),

  // Job-specific insights
  getJobInsights: (jobId: string): Promise<AnalyticsInsight[]> =>
    apiGet(`/analytics/jobs/${jobId}/insights`),

  // Metrics recording
  recordMetric: (data: MetricRecordRequest): Promise<{ message: string }> =>
    apiPost('/analytics/metrics/record', data),

  // Event tracking
  trackEvent: (data: EventTrackingRequest): Promise<{ message: string }> =>
    apiPost('/analytics/events/track', data),

  // Usage analytics
  getUsage: (params?: { 
    period?: string; 
    feature?: string;
    user_id?: string 
  }): Promise<AnalyticsUsage> =>
    apiGet('/analytics/usage', { params }),

  // Health checks
  checkHealth: (): Promise<{ status: string; metrics: any }> =>
    apiGet('/analytics/health'),
};

export default analyticsApi;