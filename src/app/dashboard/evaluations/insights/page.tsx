'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BeakerIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { AuthenticatedRoute } from '@/components/auth/protected-route';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useJobs } from '@/hooks/jobs';
import { useCandidates } from '@/hooks/candidates';
import { useEvaluations } from '@/hooks/evaluations';

export default function EvaluationInsightsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedJob, setSelectedJob] = useState<string>('all');
  
  const { data: jobs = [], isLoading: jobsLoading } = useJobs();
  const { data: candidatesData, isLoading: candidatesLoading } = useCandidates();
  const { data: evaluationsData, isLoading: evaluationsLoading } = useEvaluations({
    job_id: selectedJob !== 'all' ? selectedJob : undefined,
  });

  // Extract data from responses
  const candidates = candidatesData?.items || [];
  const evaluations = evaluationsData || [];

  // Calculate insights
  const totalEvaluations = evaluations.length;
  const completedEvaluations = evaluations.filter(e => e.overall_score !== null).length;
  const averageScore = completedEvaluations > 0 
    ? evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / completedEvaluations 
    : 0;

  // Qualification tier distribution
  const tierDistribution = evaluations.reduce((acc, e) => {
    if (e.qualification_tier) {
      acc[e.qualification_tier] = (acc[e.qualification_tier] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Job performance
  const jobPerformance = jobs.map(job => {
    const jobEvaluations = evaluations.filter(e => e.job_id === job.id);
    const avgScore = jobEvaluations.length > 0
      ? jobEvaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / jobEvaluations.length
      : 0;
    
    return {
      ...job,
      evaluationCount: jobEvaluations.length,
      averageScore: avgScore,
    };
  }).sort((a, b) => b.evaluationCount - a.evaluationCount);

  const isLoading = jobsLoading || candidatesLoading || evaluationsLoading;

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
                  <h1 className="text-2xl font-bold text-gray-900">Evaluation Insights</h1>
                  <p className="text-gray-600">Analytics and trends across your evaluation data</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Jobs</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>

                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <LoadingSpinner size="sm" />
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
                        <p className="text-2xl font-bold text-gray-900">{totalEvaluations}</p>
                      </div>
                      <BeakerIcon className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">
                        {completedEvaluations} completed
                      </span>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Average Score</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {(averageScore * 100).toFixed(1)}%
                        </p>
                      </div>
                      <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">
                        Across all evaluations
                      </span>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Jobs Evaluated</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {jobPerformance.filter(j => j.evaluationCount > 0).length}
                        </p>
                      </div>
                      <BriefcaseIcon className="h-8 w-8 text-purple-500" />
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">
                        Of {jobs.length} total jobs
                      </span>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Candidates Processed</p>
                        <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
                      </div>
                      <UserGroupIcon className="h-8 w-8 text-orange-500" />
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">
                        Available for evaluation
                      </span>
                    </div>
                  </Card>
                </div>

                {/* Qualification Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ChartBarIcon className="h-5 w-5 text-blue-500" />
                      Qualification Tier Distribution
                    </h3>
                    {Object.keys(tierDistribution).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(tierDistribution).map(([tier, count]) => (
                          <div key={tier} className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{tier}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${(count / totalEvaluations) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No qualification data available</p>
                        <p className="text-sm">Complete evaluations to see distribution</p>
                      </div>
                    )}
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BriefcaseIcon className="h-5 w-5 text-purple-500" />
                      Job Performance
                    </h3>
                    {jobPerformance.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {jobPerformance.slice(0, 10).map((job) => (
                          <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 truncate">{job.title}</p>
                              <p className="text-sm text-gray-600">{job.department || 'No Department'}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" size="sm">
                                  {job.evaluationCount} evals
                                </Badge>
                                {job.evaluationCount > 0 && (
                                  <Badge 
                                    variant={job.averageScore >= 0.8 ? 'success' : 
                                            job.averageScore >= 0.6 ? 'primary' : 'warning'}
                                    size="sm"
                                  >
                                    {(job.averageScore * 100).toFixed(0)}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BriefcaseIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No job data available</p>
                        <p className="text-sm">Create jobs and run evaluations to see performance</p>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Recent Evaluations */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-green-500" />
                    Recent Evaluations
                  </h3>
                  {evaluations.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Candidate</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Job</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Score</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Tier</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {evaluations.slice(0, 10).map((evaluation) => {
                            const candidate = candidates.find(c => c.id === evaluation.candidate_id);
                            const job = jobs.find(j => j.id === evaluation.job_id);
                            
                            return (
                              <tr key={evaluation.evaluation_id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Unknown'}
                                    </p>
                                    <p className="text-sm text-gray-600">{candidate?.email}</p>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <p className="text-gray-900">{job?.title || 'Unknown Job'}</p>
                                  <p className="text-sm text-gray-600">{job?.department}</p>
                                </td>
                                <td className="py-3 px-4">
                                  {evaluation.overall_score ? (
                                    <span className="font-medium">
                                      {((evaluation.overall_score || 0) * 100).toFixed(1)}%
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">Pending</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  {evaluation.qualification_tier ? (
                                    <Badge 
                                      variant={(evaluation.overall_score || 0) >= 0.8 ? 'success' : 
                                              (evaluation.overall_score || 0) >= 0.6 ? 'primary' : 'warning'}
                                      size="sm"
                                    >
                                      {evaluation.qualification_tier}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" size="sm">Pending</Badge>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                  {new Date(evaluation.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/dashboard/evaluations/${evaluation.evaluation_id}`)}
                                    className="flex items-center gap-1"
                                  >
                                    <EyeIcon className="h-3 w-3" />
                                    View
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BeakerIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No evaluations completed yet</p>
                      <p className="text-sm">Run your first evaluation to see insights here</p>
                    </div>
                  )}
                </Card>

                {/* Recommendations */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    Recommendations
                  </h3>
                  <div className="space-y-3">
                    {totalEvaluations === 0 && (
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <ExclamationTriangleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-blue-900">Get started with evaluations</p>
                          <p className="text-sm text-blue-700">Upload candidate CVs and run your first evaluation to unlock insights.</p>
                        </div>
                      </div>
                    )}
                    
                    {totalEvaluations > 0 && averageScore < 0.6 && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-yellow-900">Review job requirements</p>
                          <p className="text-sm text-yellow-700">Average scores are low. Consider reviewing job scorecards and requirements.</p>
                        </div>
                      </div>
                    )}
                    
                    {jobPerformance.filter(j => j.evaluationCount > 0).length < jobs.length / 2 && (
                      <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <BriefcaseIcon className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-purple-900">Expand evaluation coverage</p>
                          <p className="text-sm text-purple-700">Many jobs haven't been evaluated yet. Consider running evaluations for all active positions.</p>
                        </div>
                      </div>
                    )}

                    {totalEvaluations >= 10 && (
                      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-green-900">Great evaluation activity!</p>
                          <p className="text-sm text-green-700">You're building valuable evaluation data. Consider creating rankings and shortlists.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </>
            )}
          </div>
        </Container>
      </DashboardLayout>
    </AuthenticatedRoute>
  );
}
