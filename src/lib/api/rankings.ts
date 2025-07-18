import {
  RankingResponse,
  RankingCreateRequest,
  RankingFilters,
  RankingAnalytics,
  RankingComparison,
  DiversityReport,
  ShortlistResponse,
  ShortlistCreateRequest,
} from '@/types/api';

import { apiGet, apiPost, apiPut, apiDelete } from './client';

// Rankings API endpoints
export const rankingsApi = {
  // Ranking CRUD operations
  createRanking: (data: RankingCreateRequest): Promise<RankingResponse> =>
    apiPost('/rankings/', data),

  // Note: Backend doesn't provide a general list endpoint
  // Rankings must be fetched by job ID using getJobRankings
  listRankings: (_filters?: RankingFilters): Promise<RankingResponse[]> => {
    throw new Error('Use getJobRankings instead - backend requires job_id for listing rankings');
  },

  getRanking: (rankingId: string): Promise<RankingResponse> =>
    apiGet(`/rankings/${rankingId}`),

  updateRanking: (rankingId: string, data: Partial<RankingCreateRequest>): Promise<RankingResponse> =>
    apiPut(`/rankings/${rankingId}`, data),

  deleteRanking: (rankingId: string): Promise<{ message: string }> =>
    apiDelete(`/rankings/${rankingId}`),

  // Job-specific rankings
  getJobRankings: (jobId: string, params?: { 
    limit?: number; 
    offset?: number;
    sort_by?: string;
    order?: 'asc' | 'desc';
  }): Promise<RankingResponse[]> =>
    apiGet(`/rankings/jobs/${jobId}`, { params }),

  // Shortlists
  getShortlists: (params?: { 
    job_id?: string; 
    status?: string;
    limit?: number;
  }): Promise<ShortlistResponse[]> =>
    apiGet('/rankings/shortlists', { params }),

  createShortlist: (data: ShortlistCreateRequest): Promise<ShortlistResponse> =>
    apiPost('/rankings/shortlists', data),

  // Advanced rankings (matching OpenAPI spec)
  createAdvancedRanking: (data: any): Promise<any> =>
    apiPost('/rankings/', data),

  getRankingDetails: (rankingId: string, params?: {
    include_analytics?: boolean;
    include_diversity_report?: boolean;
  }): Promise<any> =>
    apiGet(`/rankings/${rankingId}`, { params }),

  // Analytics and insights
  getRankingAnalytics: (rankingId: string, params?: {
    analytics_type?: string;
  }): Promise<RankingAnalytics> =>
    apiGet(`/rankings/${rankingId}/analytics`, { params }),

  compareRankings: (rankingId: string, compareWith: string[], params?: {
    comparison_metrics?: string[];
  }): Promise<RankingComparison> =>
    apiPost(`/rankings/${rankingId}/compare`, compareWith, { params }),

  getDiversityReport: (rankingId: string, params?: {
    include_bias_analysis?: boolean;
    include_recommendations?: boolean;
  }): Promise<DiversityReport> =>
    apiGet(`/rankings/${rankingId}/diversity-report`, { params }),

  // Batch operations
  batchUpdateRankings: (updates: Array<{
    ranking_id: string;
    data: Partial<RankingCreateRequest>;
  }>): Promise<{ message: string; results: RankingResponse[] }> =>
    apiPost('/rankings/batch-update', { updates }),

  // Health checks
  checkHealth: (): Promise<{ status: string; processing_queue: number }> =>
    apiGet('/rankings/health'),
};

export default rankingsApi;