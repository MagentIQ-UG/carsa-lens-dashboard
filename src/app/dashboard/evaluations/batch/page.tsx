'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BoltIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { AuthenticatedRoute } from '@/components/auth/protected-route';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useJobs } from '@/hooks/jobs';
import { useCandidates } from '@/hooks/candidates';
import { useBatchEvaluate } from '@/hooks/evaluations';

export default function BatchEvaluationPage() {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState('');
  
  const { data: jobs = [], isLoading: jobsLoading } = useJobs();
  const { data: candidatesData, isLoading: candidatesLoading } = useCandidates();
  const batchEvaluate = useBatchEvaluate();

  // Extract candidates array from response
  const candidates = candidatesData?.items || [];

  const handleCandidateToggle = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map(c => c.id));
    }
  };

  const handleBatchEvaluate = async () => {
    if (!selectedJob || selectedCandidates.length === 0) {
      return;
    }

    try {
      await batchEvaluate.mutateAsync({
        job_id: selectedJob,
        candidate_ids: selectedCandidates,
        custom_instructions: customInstructions || undefined,
      });
      
      // Navigate back to evaluations list
      router.push('/dashboard/evaluations');
    } catch (error) {
      console.error('Batch evaluation failed:', error);
    }
  };

  const isEvaluating = batchEvaluate.isPending;
  const canEvaluate = selectedJob && selectedCandidates.length > 0 && !isEvaluating;

  return (
    <AuthenticatedRoute>
      <DashboardLayout>
        <Container>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Batch Candidate Evaluation</h1>
                  <p className="text-gray-600">Evaluate multiple candidates simultaneously for efficiency</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Section */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <BoltIcon className="h-5 w-5 text-purple-500" />
                    Batch Evaluation Setup
                  </h2>

                  <div className="space-y-6">
                    {/* Job Selection */}
                    <div>
                      <Label htmlFor="job-select" className="text-sm font-medium mb-2 flex items-center gap-2">
                        <BriefcaseIcon className="h-4 w-4" />
                        Select Job Position
                      </Label>
                      {jobsLoading ? (
                        <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                          <LoadingSpinner size="sm" />
                          <span className="text-sm text-gray-500">Loading jobs...</span>
                        </div>
                      ) : (
                        <select
                          id="job-select"
                          value={selectedJob}
                          onChange={(e) => setSelectedJob(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">Choose a job position...</option>
                          {jobs.map((job) => (
                            <option key={job.id} value={job.id}>
                              {job.title} - {job.department || 'No Department'}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Candidate Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <UserGroupIcon className="h-4 w-4" />
                          Select Candidates ({selectedCandidates.length} selected)
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                          disabled={candidatesLoading}
                        >
                          {selectedCandidates.length === candidates.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                      
                      {candidatesLoading ? (
                        <div className="flex items-center gap-2 p-4 border border-gray-200 rounded-md">
                          <LoadingSpinner size="sm" />
                          <span className="text-sm text-gray-500">Loading candidates...</span>
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
                          {candidates.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              No candidates available
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-200">
                              {candidates.map((candidate) => (
                                <div key={candidate.id} className="p-3 flex items-center gap-3 hover:bg-gray-50">
                                  <Checkbox
                                    id={`candidate-${candidate.id}`}
                                    checked={selectedCandidates.includes(candidate.id)}
                                    onCheckedChange={() => handleCandidateToggle(candidate.id)}
                                  />
                                  <label
                                    htmlFor={`candidate-${candidate.id}`}
                                    className="flex-1 cursor-pointer"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {candidate.first_name} {candidate.last_name}
                                        </p>
                                        <p className="text-sm text-gray-500">{candidate.email}</p>
                                      </div>
                                      <Badge 
                                        variant={candidate.processing_status === 'completed' ? 'success' : 'warning'}
                                        size="sm"
                                      >
                                        {candidate.processing_status}
                                      </Badge>
                                    </div>
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Custom Instructions */}
                    <div>
                      <Label htmlFor="instructions" className="text-sm font-medium mb-2">
                        Custom Instructions (Optional)
                      </Label>
                      <textarea
                        id="instructions"
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        placeholder="Add any specific evaluation criteria or focus areas for all candidates..."
                        rows={3}
                        className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    {/* Evaluate Button */}
                    <div className="pt-4 border-t border-gray-200">
                      <Button
                        onClick={handleBatchEvaluate}
                        disabled={!canEvaluate}
                        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
                      >
                        {isEvaluating ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Evaluating {selectedCandidates.length} candidates...
                          </>
                        ) : (
                          <>
                            <BoltIcon className="h-4 w-4" />
                            Start Batch Evaluation
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Info Section */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-blue-500" />
                    Batch Processing
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• All candidates evaluated in parallel</li>
                    <li>• Faster than individual evaluations</li>
                    <li>• Consistent scoring across candidates</li>
                    <li>• Results available within minutes</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                    Recommendations
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Maximum 50 candidates per batch</li>
                    <li>• Ensure all candidates are processed</li>
                    <li>• Job must have valid scorecard</li>
                    <li>• Processing time: ~2-5 minutes</li>
                  </ul>
                </Card>

                {/* Selection Summary */}
                {(selectedJob || selectedCandidates.length > 0) && (
                  <Card className="p-4">
                    <h3 className="font-medium mb-3">Batch Summary</h3>
                    <div className="space-y-2 text-sm">
                      {selectedJob && (
                        <div>
                          <span className="text-gray-500">Job:</span>{' '}
                          <span className="font-medium">
                            {jobs.find(j => j.id === selectedJob)?.title || 'Selected'}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Candidates:</span>{' '}
                        <span className="font-medium">
                          {selectedCandidates.length} selected
                        </span>
                      </div>
                      {selectedCandidates.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            Estimated time: {Math.ceil(selectedCandidates.length / 10)} minutes
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </Container>
      </DashboardLayout>
    </AuthenticatedRoute>
  );
}
