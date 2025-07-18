/**
 * Evaluation Center Components
 * Core components for AI-powered candidate evaluation
 */

'use client';

import { useState, useCallback } from 'react';
import { 
  PlayIcon, 
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  UserIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  useEvaluateCandidate, 
  useBatchEvaluate, 
  useEvaluationComparison 
} from '@/hooks/evaluations';
import { useCandidates } from '@/hooks/candidates';
import { useJobs } from '@/hooks/jobs';
import type { 
  EvaluationProgress, 
  EvaluationSession, 
  EvaluationResponse,
  CandidateResponse,
  ProcessingStatus
} from '@/types/api';

interface CandidateSelectorProps {
  jobId?: string;
  selectedCandidates: string[];
  onSelectionChange: (candidateIds: string[]) => void;
  maxSelection?: number;
}

export function CandidateSelector({
  jobId,
  selectedCandidates,
  onSelectionChange,
  maxSelection = 10
}: CandidateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProcessingStatus | ''>('completed' as ProcessingStatus);

  const { data: candidatesData, isLoading } = useCandidates({
    search: searchTerm,
    status_filter: statusFilter || undefined,
    limit: 50
  });

  const candidates = candidatesData?.items || [];

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = !searchTerm || 
      `${candidate.first_name} ${candidate.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const toggleCandidate = useCallback((candidateId: string) => {
    if (selectedCandidates.includes(candidateId)) {
      onSelectionChange(selectedCandidates.filter(id => id !== candidateId));
    } else if (selectedCandidates.length < maxSelection) {
      onSelectionChange([...selectedCandidates, candidateId]);
    }
  }, [selectedCandidates, onSelectionChange, maxSelection]);

  const selectAll = useCallback(() => {
    const availableIds = filteredCandidates
      .slice(0, maxSelection)
      .map(c => c.id);
    onSelectionChange(availableIds);
  }, [filteredCandidates, maxSelection, onSelectionChange]);

  const clearSelection = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Select Candidates</h3>
        <div className="flex items-center space-x-2">
          <Badge variant={selectedCandidates.length > 0 ? 'primary' : 'secondary'}>
            {selectedCandidates.length} selected
          </Badge>
          {selectedCandidates.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Search candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProcessingStatus | '')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
          </select>
          
          {filteredCandidates.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              disabled={selectedCandidates.length >= maxSelection}
            >
              Select All ({Math.min(filteredCandidates.length, maxSelection)})
            </Button>
          )}
        </div>
      </div>

      {/* Candidate List */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map((candidate) => {
            const isSelected = selectedCandidates.includes(candidate.id);
            const isDisabled = !isSelected && selectedCandidates.length >= maxSelection;

            return (
              <div
                key={candidate.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50'
                    : isDisabled
                    ? 'border-gray-200 bg-gray-50 opacity-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => !isDisabled && toggleCandidate(candidate.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {candidate.first_name} {candidate.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{candidate.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      candidate.processing_status === 'completed' ? 'success' :
                      candidate.processing_status === 'processing' ? 'primary' :
                      'secondary'
                    } size="sm">
                      {candidate.processing_status}
                    </Badge>
                    {candidate.confidence_score && (
                      <p className="text-xs text-gray-500 mt-1">
                        Confidence: {(candidate.confidence_score * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No candidates found</p>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {selectedCandidates.length >= maxSelection && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            Maximum selection limit reached ({maxSelection} candidates)
          </p>
        </div>
      )}
    </Card>
  );
}

interface EvaluationProgressProps {
  progress: EvaluationProgress[];
  session: EvaluationSession | null;
  onCancel?: () => void;
}

export function EvaluationProgressTracker({ 
  progress, 
  session, 
  onCancel 
}: EvaluationProgressProps) {
  const getStatusIcon = (status: EvaluationProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <ClockIcon className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: EvaluationProgress['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'processing': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  const overallProgress = progress.length > 0 
    ? progress.reduce((sum, p) => sum + p.progress_percentage, 0) / progress.length
    : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Evaluation Progress</h3>
        {session?.status === 'active' && onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            <PauseIcon className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
      </div>

      {session && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Overall Progress</span>
            <span className="text-sm font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{session.total_candidates}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{session.completed_count}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{session.failed_count}</p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {progress.map((item) => (
          <div key={item.evaluation_id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            {getStatusIcon(item.status)}
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                Candidate {item.candidate_id.slice(0, 8)}...
              </p>
              <p className="text-sm text-gray-600">{item.stage}</p>
              {item.error_message && (
                <p className="text-sm text-red-600">{item.error_message}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{Math.round(item.progress_percentage)}%</p>
              {item.estimated_completion && (
                <p className="text-xs text-gray-500">
                  ETA: {new Date(item.estimated_completion).toLocaleTimeString()}
                </p>
              )}
            </div>
            {item.status === 'processing' && (
              <div className="w-16">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full transition-all ${getStatusColor(item.status)}`}
                    style={{ width: `${item.progress_percentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {progress.length === 0 && (
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No evaluations in progress</p>
        </div>
      )}
    </Card>
  );
}

interface SingleEvaluationProps {
  jobId: string;
  candidateId: string;
  onComplete?: (result: EvaluationResponse) => void;
}

export function SingleEvaluationPanel({ 
  jobId, 
  candidateId, 
  onComplete 
}: SingleEvaluationProps) {
  const [customInstructions, setCustomInstructions] = useState('');
  const { mutate: evaluateCandidate, isPending, error } = useEvaluateCandidate();

  const handleEvaluate = () => {
    evaluateCandidate({
      candidate_id: candidateId,
      job_id: jobId,
      custom_instructions: customInstructions || undefined,
    }, {
      onSuccess: (data) => {
        if (data.data && onComplete) {
          onComplete(data.data);
        }
      },
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Single Candidate Evaluation</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Instructions (Optional)
          </label>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Add specific evaluation criteria or focus areas..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              Evaluation failed: {error.message}
            </p>
          </div>
        )}

        <Button
          onClick={handleEvaluate}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Evaluating...
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4 mr-2" />
              Start Evaluation
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

interface BatchEvaluationProps {
  jobId: string;
  candidateIds: string[];
  onComplete?: () => void;
}

export function BatchEvaluationPanel({ 
  jobId, 
  candidateIds, 
  onComplete 
}: BatchEvaluationProps) {
  const [concurrency, setConcurrency] = useState(3);
  const [customInstructions, setCustomInstructions] = useState('');
  
  const { 
    mutate: batchEvaluate, 
    isPending, 
    error,
    progress,
    session,
    clearProgress
  } = useBatchEvaluate();

  const handleBatchEvaluate = () => {
    if (candidateIds.length === 0) return;

    batchEvaluate({
      candidate_ids: candidateIds,
      job_id: jobId,
      concurrency,
      custom_instructions: customInstructions || undefined,
    }, {
      onSuccess: () => {
        if (onComplete) {
          onComplete();
        }
      },
    });
  };

  const handleCancel = () => {
    clearProgress();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Batch Evaluation Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Candidates Selected: {candidateIds.length}
            </label>
            <p className="text-sm text-gray-600">
              Maximum of 50 candidates can be evaluated in a single batch
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Concurrency Level: {concurrency}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={concurrency}
              onChange={(e) => setConcurrency(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Higher concurrency = faster processing but higher resource usage
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Instructions (Optional)
            </label>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Add specific evaluation criteria or focus areas for all candidates..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                Batch evaluation failed: {error.message}
              </p>
            </div>
          )}

          <Button
            onClick={handleBatchEvaluate}
            disabled={isPending || candidateIds.length === 0}
            className="w-full"
          >
            {isPending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing Batch...
              </>
            ) : (
              <>
                <BoltIcon className="w-4 h-4 mr-2" />
                Start Batch Evaluation ({candidateIds.length} candidates)
              </>
            )}
          </Button>
        </div>
      </Card>

      {(isPending || progress.length > 0) && (
        <EvaluationProgressTracker
          progress={progress}
          session={session}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
