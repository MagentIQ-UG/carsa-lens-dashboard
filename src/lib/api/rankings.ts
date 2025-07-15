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

  listRankings: (filters?: RankingFilters): Promise<RankingResponse[]> =>
    apiGet('/rankings/', { params: filters }),

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

  // Analytics and insights
  getRankingAnalytics: (rankingId: string): Promise<RankingAnalytics> =>
    apiGet(`/rankings/${rankingId}/analytics`),

  compareRankings: (rankingId: string, compareWith: string[]): Promise<RankingComparison> =>
    apiPost(`/rankings/${rankingId}/compare`, { compare_with: compareWith }),

  getDiversityReport: (rankingId: string): Promise<DiversityReport> =>
    apiGet(`/rankings/${rankingId}/diversity-report`),

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