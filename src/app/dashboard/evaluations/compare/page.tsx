'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChartBarIcon,
  UserIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  ScaleIcon,
  TrophyIcon,
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
import { useEvaluations } from '@/hooks/evaluations';

export default function CompareCandidatesPage() {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  
  const { data: jobs = [], isLoading: jobsLoading } = useJobs();
  const { data: candidatesData, isLoading: candidatesLoading } = useCandidates();
  const { data: evaluationsData } = useEvaluations({
    job_id: selectedJob || undefined,
  });

  // Extract candidates and evaluations arrays from response
  const candidates = candidatesData?.items || [];
  const evaluations = evaluationsData || [];

  const handleCandidateToggle = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : prev.length < 5 ? [...prev, candidateId] : prev // Max 5 candidates
    );
  };

  const selectedCandidateData = candidates.filter(c => selectedCandidates.includes(c.id));
  const candidateEvaluations = evaluations.filter(e => selectedCandidates.includes(e.candidate_id));

  const canCompare = selectedCandidates.length >= 2;

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
                  <h1 className="text-2xl font-bold text-gray-900">Compare Candidates</h1>
                  <p className="text-gray-600">Side-by-side comparison of candidate evaluations</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Selection Panel */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <ScaleIcon className="h-4 w-4 text-green-500" />
                    Selection
                  </h3>

                  {/* Job Selection */}
                  <div className="mb-4">
                    <Label htmlFor="job-select" className="text-sm font-medium mb-2 flex items-center gap-2">
                      <BriefcaseIcon className="h-4 w-4" />
                      Job Position
                    </Label>
                    {jobsLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <select
                        id="job-select"
                        value={selectedJob}
                        onChange={(e) => setSelectedJob(e.target.value)}
                        className="w-full p-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Choose job...</option>
                        {jobs.map((job) => (
                          <option key={job.id} value={job.id}>
                            {job.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Candidate Selection */}
                  <div>
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Candidates ({selectedCandidates.length}/5)
                    </Label>
                    {candidatesLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {candidates.filter(c => 
                          !selectedJob || evaluations.some(e => e.candidate_id === c.id)
                        ).map((candidate) => (
                          <div key={candidate.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`candidate-${candidate.id}`}
                              checked={selectedCandidates.includes(candidate.id)}
                              onCheckedChange={() => handleCandidateToggle(candidate.id)}
                              disabled={!selectedCandidates.includes(candidate.id) && selectedCandidates.length >= 5}
                            />
                            <label
                              htmlFor={`candidate-${candidate.id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {candidate.first_name} {candidate.last_name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                {selectedCandidates.length >= 2 && (
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Comparison Ready</h4>
                    <p className="text-xs text-gray-600 mb-3">
                      {selectedCandidates.length} candidates selected for comparison
                    </p>
                    <Button size="sm" className="w-full">
                      <ChartBarIcon className="h-4 w-4 mr-2" />
                      View Detailed Analysis
                    </Button>
                  </Card>
                )}
              </div>

              {/* Comparison View */}
              <div className="lg:col-span-3">
                {!canCompare ? (
                  <Card className="p-8 text-center">
                    <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Compare</h3>
                    <p className="text-gray-600 mb-4">
                      Select a job position and at least 2 candidates to start comparison
                    </p>
                    <div className="text-sm text-gray-500">
                      <p>• Choose from evaluated candidates only</p>
                      <p>• Compare up to 5 candidates at once</p>
                      <p>• View scores, strengths, and gaps side-by-side</p>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {/* Comparison Header */}
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Candidate Comparison</h3>
                        <Badge variant="primary">
                          {selectedCandidates.length} candidates
                        </Badge>
                      </div>
                    </Card>

                    {/* Comparison Table */}
                    <Card className="overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                Criteria
                              </th>
                              {selectedCandidateData.map((candidate) => (
                                <th key={candidate.id} className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                                  <div>
                                    <p>{candidate.first_name} {candidate.last_name}</p>
                                    <p className="text-xs text-gray-500 font-normal">{candidate.email}</p>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {/* Overall Score */}
                            <tr>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                Overall Score
                              </td>
                              {selectedCandidateData.map((candidate) => {
                                const evaluation = candidateEvaluations.find(e => e.candidate_id === candidate.id);
                                return (
                                  <td key={candidate.id} className="px-4 py-3 text-center">
                                    {evaluation ? (
                                      <div className="flex flex-col items-center">
                                        <span className="text-lg font-semibold">
                                          {((evaluation.overall_score || 0) * 100).toFixed(1)}%
                                        </span>
                                        <Badge 
                                          variant={(evaluation.overall_score || 0) >= 0.8 ? 'success' : 
                                                  (evaluation.overall_score || 0) >= 0.6 ? 'primary' : 'warning'}
                                          size="sm"
                                        >
                                          {evaluation.qualification_tier}
                                        </Badge>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">No evaluation</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>

                            {/* Confidence Level */}
                            <tr className="bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                Confidence Level
                              </td>
                              {selectedCandidateData.map((candidate) => {
                                const evaluation = candidateEvaluations.find(e => e.candidate_id === candidate.id);
                                return (
                                  <td key={candidate.id} className="px-4 py-3 text-center">
                                    {evaluation ? (
                                      <span className="text-sm">
                                        {(evaluation.confidence_level * 100).toFixed(0)}%
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>

                            {/* Strengths */}
                            <tr>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                Key Strengths
                              </td>
                              {selectedCandidateData.map((candidate) => {
                                return (
                                  <td key={candidate.id} className="px-4 py-3">
                                    <span className="text-gray-400 text-xs">
                                      Detailed data not available in list view
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>

                            {/* Gaps */}
                            <tr className="bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                Development Areas
                              </td>
                              {selectedCandidateData.map((candidate) => {
                                return (
                                  <td key={candidate.id} className="px-4 py-3">
                                    <span className="text-gray-400 text-xs">
                                      Detailed data not available in list view
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </Card>

                    {/* Recommendation */}
                    <Card className="p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <TrophyIcon className="h-4 w-4 text-yellow-500" />
                        Recommendation
                      </h4>
                      <p className="text-sm text-gray-600">
                        Based on the comparison above, consider the candidate with the highest overall score 
                        and confidence level. Review specific strengths that align with your role requirements.
                      </p>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </DashboardLayout>
    </AuthenticatedRoute>
  );
}
