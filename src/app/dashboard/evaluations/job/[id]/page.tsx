'use client';

import { useParams, useRouter } from 'next/navigation';
import { 
  BriefcaseIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  PlayIcon,
  EyeIcon,
  StarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { AuthenticatedRoute } from '@/components/auth/protected-route';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useJob } from '@/hooks/jobs';
import { useCandidates } from '@/hooks/candidates';
import { useEvaluations } from '@/hooks/evaluations';
import { QualificationTier } from '@/types/api';

interface CandidateEvaluationSummary {
  id: string;
  name: string;
  email?: string;
  status: 'pending' | 'evaluating' | 'completed' | 'failed';
  score?: number;
  qualification_tier?: QualificationTier;
  evaluated_at?: string;
  strengths?: string[];
  gaps?: string[];
}

export default function JobEvaluationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const { data: job, isLoading: jobLoading } = useJob(jobId);
  const { data: candidatesData, isLoading: candidatesLoading } = useCandidates();
  const { data: evaluationsData, isLoading: evaluationsLoading } = useEvaluations({
    job_id: jobId,
  });

  // Extract candidates and evaluations arrays from response
  const candidates = candidatesData?.items || [];
  const evaluations = evaluationsData || [];

  // Calculate job-specific candidates and their evaluation status
  const jobCandidates: CandidateEvaluationSummary[] = candidates
    .map(candidate => {
      const evaluation = evaluations.find(evaluation => evaluation.candidate_id === candidate.id);
      return {
        id: candidate.id,
        name: `${candidate.first_name} ${candidate.last_name}`,
        email: candidate.email,
        status: evaluation ? 'completed' : 'pending',
        score: evaluation?.overall_score,
        qualification_tier: evaluation?.qualification_tier,
        evaluated_at: evaluation?.created_at,
        strengths: evaluation?.strengths,
        gaps: evaluation?.gaps,
      };
    });

  const evaluatedCandidates = jobCandidates.filter(c => c.status === 'completed');
  const pendingCandidates = jobCandidates.filter(c => c.status === 'pending');
  
  const averageScore = evaluatedCandidates.length > 0
    ? evaluatedCandidates.reduce((sum, c) => sum + (c.score || 0), 0) / evaluatedCandidates.length
    : 0;

  const tierCounts = {
    highly_qualified: evaluatedCandidates.filter(c => c.qualification_tier === QualificationTier.HIGHLY_QUALIFIED).length,
    qualified: evaluatedCandidates.filter(c => c.qualification_tier === QualificationTier.QUALIFIED).length,
    partially_qualified: evaluatedCandidates.filter(c => c.qualification_tier === QualificationTier.PARTIALLY_QUALIFIED).length,
    not_qualified: evaluatedCandidates.filter(c => c.qualification_tier === QualificationTier.NOT_QUALIFIED).length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'evaluating': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTierColor = (tier?: QualificationTier) => {
    switch (tier) {
      case QualificationTier.HIGHLY_QUALIFIED: return 'text-green-600 bg-green-50';
      case QualificationTier.QUALIFIED: return 'text-blue-600 bg-blue-50';
      case QualificationTier.PARTIALLY_QUALIFIED: return 'text-yellow-600 bg-yellow-50';
      case QualificationTier.NOT_QUALIFIED: return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTierIcon = (tier?: QualificationTier) => {
    switch (tier) {
      case QualificationTier.HIGHLY_QUALIFIED: return <StarIcon className="w-4 h-4" />;
      case QualificationTier.QUALIFIED: return <TrophyIcon className="w-4 h-4" />;
      case QualificationTier.PARTIALLY_QUALIFIED: return <CheckCircleIcon className="w-4 h-4" />;
      case QualificationTier.NOT_QUALIFIED: return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getTierLabel = (tier?: QualificationTier) => {
    switch (tier) {
      case QualificationTier.HIGHLY_QUALIFIED: return 'Highly Qualified';
      case QualificationTier.QUALIFIED: return 'Qualified';
      case QualificationTier.PARTIALLY_QUALIFIED: return 'Partially Qualified';
      case QualificationTier.NOT_QUALIFIED: return 'Not Qualified';
      default: return 'Pending';
    }
  };

  if (jobLoading || candidatesLoading || evaluationsLoading) {
    return (
      <AuthenticatedRoute>
        <DashboardLayout>
          <Container className="py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner />
            </div>
          </Container>
        </DashboardLayout>
      </AuthenticatedRoute>
    );
  }

  if (!job) {
    return (
      <AuthenticatedRoute>
        <DashboardLayout>
          <Container className="py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
              <p className="text-gray-600 mb-6">The job you're looking for doesn't exist.</p>
              <Button onClick={() => router.push('/dashboard/evaluations')}>
                Back to Evaluations
              </Button>
            </div>
          </Container>
        </DashboardLayout>
      </AuthenticatedRoute>
    );
  }

  return (
    <AuthenticatedRoute>
      <DashboardLayout>
        <Container className="py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <BriefcaseIcon className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              </div>
              <p className="text-gray-600">
                Job evaluation details and candidate performance overview
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push(`/dashboard/evaluations/batch?job=${jobId}`)}
                className="flex items-center gap-2"
                disabled={pendingCandidates.length === 0}
              >
                <PlayIcon className="w-4 h-4" />
                Evaluate Pending ({pendingCandidates.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/jobs/${jobId}`)}
                className="flex items-center gap-2"
              >
                <EyeIcon className="w-4 h-4" />
                View Job
              </Button>
            </div>
          </div>

          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <UserGroupIcon className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Candidates</p>
                  <p className="text-2xl font-bold text-gray-900">{jobCandidates.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Evaluated</p>
                  <p className="text-2xl font-bold text-gray-900">{evaluatedCandidates.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <ChartBarIcon className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {averageScore > 0 ? `${Math.round(averageScore)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <TrophyIcon className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Top Tier</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tierCounts.highly_qualified + tierCounts.qualified}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Qualification Tier Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Qualification Tiers
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">Highly Qualified</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {tierCounts.highly_qualified}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Qualified</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {tierCounts.qualified}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-gray-700">Partially Qualified</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {tierCounts.partially_qualified}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-gray-700">Not Qualified</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {tierCounts.not_qualified}
                  </span>
                </div>
              </div>
            </Card>

            {/* Candidates List */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Candidate Evaluations
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/evaluations/compare?job=${jobId}`)}
                    disabled={evaluatedCandidates.length < 2}
                  >
                    Compare Candidates
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {jobCandidates.map((candidate) => (
                  <Card key={candidate.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">
                          {candidate.name}
                        </h4>
                        <p className="text-sm text-gray-600">{candidate.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(candidate.status)}>
                          {candidate.status === 'completed' ? 'Evaluated' : 'Pending'}
                        </Badge>
                        {candidate.qualification_tier && (
                          <Badge className={getTierColor(candidate.qualification_tier)}>
                            <div className="flex items-center gap-1">
                              {getTierIcon(candidate.qualification_tier)}
                              {getTierLabel(candidate.qualification_tier)}
                            </div>
                          </Badge>
                        )}
                      </div>
                    </div>

                    {candidate.status === 'completed' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Overall Score</p>
                          <p className="text-xl font-bold text-gray-900">
                            {candidate.score ? `${Math.round(candidate.score)}%` : 'N/A'}
                          </p>
                        </div>
                        
                        {candidate.evaluated_at && (
                          <div>
                            <p className="text-sm text-gray-600">Evaluated</p>
                            <p className="text-sm text-gray-900 flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              {new Date(candidate.evaluated_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/candidates/${candidate.id}`)}
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    )}

                    {candidate.status === 'pending' && (
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => router.push(`/dashboard/evaluations/single?job=${jobId}&candidate=${candidate.id}`)}
                        >
                          Evaluate Now
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}

                {jobCandidates.length === 0 && (
                  <Card className="p-8 text-center">
                    <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No candidates found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      No candidates have applied to this job yet.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/dashboard/jobs/${jobId}`)}
                    >
                      View Job Details
                    </Button>
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
