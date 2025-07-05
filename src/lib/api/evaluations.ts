import {
  EvaluateRequest,
  BatchEvaluateRequest,
  EvaluationResponse,
  BatchEvaluationResponse,
  EvaluationFilters,
  BaseResponse,
} from '@/types/api';

import { apiGet, apiPost } from './client';

// Evaluations API endpoints
export const evaluationsApi = {
  // Single candidate evaluation
  evaluateCandidate: (data: EvaluateRequest): Promise<BaseResponse<EvaluationResponse>> =>
    apiPost('/evaluations/evaluate', data),

  // Batch evaluation
  batchEvaluate: (data: BatchEvaluateRequest): Promise<BaseResponse<BatchEvaluationResponse>> =>
    apiPost('/evaluations/batch', data),

  // Evaluation results
  getEvaluation: (evaluationId: string): Promise<BaseResponse<EvaluationResponse>> =>
    apiGet(`/evaluations/${evaluationId}`),

  listEvaluations: (filters?: EvaluationFilters): Promise<EvaluationResponse[]> =>
    apiGet('/evaluations', { params: filters }),

  // Evaluation analytics
  getEvaluationSummary: (jobId: string): Promise<{
    job_id: string;
    total_evaluations: number;
    average_score: number;
    qualification_distribution: Record<string, number>;
    top_strengths: string[];
    common_gaps: string[];
    evaluation_trends: Record<string, unknown>[];
  }> =>
    apiGet(`/evaluations/summary/${jobId}`),

  // Re-evaluation
  reEvaluateCandidate: (
    evaluationId: string,
    customInstructions?: string
  ): Promise<BaseResponse<EvaluationResponse>> =>
    apiPost(`/evaluations/${evaluationId}/re-evaluate`, { custom_instructions: customInstructions }),
};

export default evaluationsApi;