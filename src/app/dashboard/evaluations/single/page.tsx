'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlayIcon,
  UserIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  SparklesIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { AuthenticatedRoute } from '@/components/auth/protected-route';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Label } from '@/components/ui/label';
import { useJobs } from '@/hooks/jobs';
import { useCandidates } from '@/hooks/candidates';
import { useEvaluateCandidate } from '@/hooks/evaluations';

export default function SingleEvaluationPage() {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [customInstructions, setCustomInstructions] = useState('');
  
  const { data: jobs = [], isLoading: jobsLoading } = useJobs();
  const { data: candidatesData, isLoading: candidatesLoading } = useCandidates();
  const evaluateCandidate = useEvaluateCandidate();
  
  // Extract candidates array from response
  const candidates = candidatesData?.items || [];

  const handleEvaluate = async () => {
    if (!selectedJob || !selectedCandidate) {
      return;
    }

    try {
      await evaluateCandidate.mutateAsync({
        job_id: selectedJob,
        candidate_id: selectedCandidate,
        custom_instructions: customInstructions || undefined,
      });
      
      // Navigate back to evaluations list
      router.push('/dashboard/evaluations');
    } catch (error) {
      console.error('Evaluation failed:', error);
    }
  };

  const isEvaluating = evaluateCandidate.isPending;
  const canEvaluate = selectedJob && selectedCandidate && !isEvaluating;

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
                  <h1 className="text-2xl font-bold text-gray-900">Single Candidate Evaluation</h1>
                  <p className="text-gray-600">Evaluate one candidate against specific job requirements</p>
                </div>
              </div>
            </div>

            {/* Evaluation Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Section */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-blue-500" />
                    Evaluation Setup
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
                          className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <Label htmlFor="candidate-select" className="text-sm font-medium mb-2 flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        Select Candidate
                      </Label>
                      {candidatesLoading ? (
                        <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                          <LoadingSpinner size="sm" />
                          <span className="text-sm text-gray-500">Loading candidates...</span>
                        </div>
                      ) : (
                        <select
                          id="candidate-select"
                          value={selectedCandidate}
                          onChange={(e) => setSelectedCandidate(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Choose a candidate...</option>
                          {candidates.map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>
                              {candidate.first_name} {candidate.last_name} - {candidate.email}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Custom Instructions */}
                    <div>
                      <Label htmlFor="instructions" className="text-sm font-medium mb-2 flex items-center gap-2">
                        <DocumentTextIcon className="h-4 w-4" />
                        Custom Instructions (Optional)
                      </Label>
                      <textarea
                        id="instructions"
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        placeholder="Add any specific evaluation criteria or focus areas..."
                        rows={4}
                        className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Provide additional context or specific areas to focus on during evaluation
                      </p>
                    </div>

                    {/* Evaluate Button */}
                    <div className="pt-4 border-t border-gray-200">
                      <Button
                        onClick={handleEvaluate}
                        disabled={!canEvaluate}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        {isEvaluating ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Evaluating...
                          </>
                        ) : (
                          <>
                            <PlayIcon className="h-4 w-4" />
                            Start Evaluation
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
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    What happens next?
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• AI analyzes candidate's profile</li>
                    <li>• Matches skills against job requirements</li>
                    <li>• Generates comprehensive evaluation report</li>
                    <li>• Provides scoring and recommendations</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                    Requirements
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Job must have an active scorecard</li>
                    <li>• Candidate profile must be processed</li>
                    <li>• Evaluation may take 30-60 seconds</li>
                  </ul>
                </Card>

                {/* Selection Summary */}
                {(selectedJob || selectedCandidate) && (
                  <Card className="p-4">
                    <h3 className="font-medium mb-3">Selection Summary</h3>
                    <div className="space-y-2 text-sm">
                      {selectedJob && (
                        <div>
                          <span className="text-gray-500">Job:</span>{' '}
                          <span className="font-medium">
                            {jobs.find(j => j.id === selectedJob)?.title || 'Selected'}
                          </span>
                        </div>
                      )}
                      {selectedCandidate && (
                        <div>
                          <span className="text-gray-500">Candidate:</span>{' '}
                          <span className="font-medium">
                            {(() => {
                              const candidate = candidates.find(c => c.id === selectedCandidate);
                              return candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Selected';
                            })()}
                          </span>
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
