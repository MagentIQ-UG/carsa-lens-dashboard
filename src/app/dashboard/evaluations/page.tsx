'use client';

import { useRouter } from 'next/navigation';
import { 
  PlayIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  BoltIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  BeakerIcon
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

// Quick Actions
const quickActions = [
  {
    id: 'evaluate-single',
    title: 'Single Evaluation',
    description: 'Evaluate one candidate against job requirements',
    icon: PlayIcon,
    color: 'bg-blue-500',
    href: '/dashboard/evaluations/single',
  },
  {
    id: 'evaluate-batch',
    title: 'Batch Evaluation',
    description: 'Evaluate multiple candidates simultaneously',
    icon: BoltIcon,
    color: 'bg-purple-500',
    href: '/dashboard/evaluations/batch',
  },
  {
    id: 'compare-candidates',
    title: 'Compare Candidates',
    description: 'Side-by-side candidate comparison',
    icon: ChartBarIcon,
    color: 'bg-emerald-500',
    href: '/dashboard/evaluations/compare',
  },
  {
    id: 'evaluation-insights',
    title: 'Evaluation Insights',
    description: 'Analytics and trends across evaluations',
    icon: BeakerIcon,
    color: 'bg-orange-500',
    href: '/dashboard/evaluations/insights',
  },
];

interface JobEvaluationSummary {
  id: string;
  title: string;
  department?: string;
  total_candidates: number;
  evaluated_candidates: number;
  pending_candidates: number;
  average_score?: number;
  last_evaluation?: string;
  top_tier_count: number;
}

function JobCard({ job }: { job: JobEvaluationSummary }) {
  const router = useRouter();
  const evaluationRate = job.total_candidates > 0 
    ? Math.round((job.evaluated_candidates / job.total_candidates) * 100) 
    : 0;

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {job.title}
          </h3>
          {job.department && (
            <p className="text-sm text-gray-600">{job.department}</p>
          )}
        </div>
        <Badge 
          variant={evaluationRate >= 50 ? 'success' : 'warning'}
          className="ml-2"
        >
          {evaluationRate}% Complete
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Candidates</span>
          <span className="font-medium">
            {job.evaluated_candidates}/{job.total_candidates}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${getProgressColor(evaluationRate)}`}
            style={{ width: `${evaluationRate}%` }}
          />
        </div>

        {job.average_score !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Average Score</span>
            <span className="font-medium">{job.average_score}%</span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Top Tier</span>
          <span className="font-medium">{job.top_tier_count} candidates</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => router.push(`/dashboard/evaluations/job/${job.id}`)}
          className="flex-1"
        >
          View Details
          <ArrowRightIcon className="w-4 h-4 ml-1" />
        </Button>
        {job.pending_candidates > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/evaluations/batch?job=${job.id}`)}
          >
            Evaluate ({job.pending_candidates})
          </Button>
        )}
      </div>
    </Card>
  );
}

function QuickActionCard({ action }: { action: typeof quickActions[0] }) {
  const router = useRouter();
  const Icon = action.icon;

  return (
    <Card 
      className="p-6 hover:shadow-lg transition-all cursor-pointer group"
      onClick={() => router.push(action.href)}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {action.title}
          </h3>
          <p className="text-gray-600 text-sm">{action.description}</p>
        </div>
        <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
    </Card>
  );
}

function OverviewMetrics() {
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: candidates, isLoading: candidatesLoading } = useCandidates();
  const { data: evaluations, isLoading: evaluationsLoading } = useEvaluations();

  if (jobsLoading || candidatesLoading || evaluationsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <LoadingSpinner size="sm" />
          </Card>
        ))}
      </div>
    );
  }

  const totalJobs = jobs?.length || 0;
  const totalCandidates = candidates?.items?.length || 0;
  const totalEvaluations = evaluations?.length || 0;
  const pendingEvaluations = Math.max(0, totalCandidates - totalEvaluations);

  const metrics = [
    {
      title: 'Active Jobs',
      value: totalJobs,
      icon: DocumentTextIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Candidates',
      value: totalCandidates,
      icon: UserGroupIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Completed Evaluations',
      value: totalEvaluations,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Evaluations',
      value: pendingEvaluations,
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <Icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function RecentActivity() {
  const { data: evaluations, isLoading } = useEvaluations({ limit: 5 });

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Evaluations</h3>
        <LoadingSpinner />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Evaluations</h3>
      {evaluations && evaluations.length > 0 ? (
        <div className="space-y-3">
          {evaluations.slice(0, 5).map((evaluation) => (
            <div key={evaluation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Candidate {evaluation.candidate_id.slice(0, 8)}...
                </p>
                <p className="text-sm text-gray-600">
                  Job {evaluation.job_id.slice(0, 8)}...
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {evaluation.overall_score || 0}%
                </p>
                <Badge 
                  variant={
                    evaluation.qualification_tier === 'highly_qualified' ? 'success' :
                    evaluation.qualification_tier === 'qualified' ? 'primary' :
                    evaluation.qualification_tier === 'partially_qualified' ? 'warning' :
                    'secondary'
                  }
                  size="sm"
                >
                  {evaluation.qualification_tier?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <BeakerIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No evaluations yet</p>
          <p className="text-sm text-gray-500">Start by evaluating some candidates</p>
        </div>
      )}
    </Card>
  );
}

export default function EvaluationCenterPage() {
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: candidates, isLoading: candidatesLoading } = useCandidates();

  // Create job evaluation summaries
  const jobSummaries: JobEvaluationSummary[] = jobs?.map(job => {
    const jobCandidates = candidates?.items?.filter((c: any) => 
      c.processing_status === 'completed'
    ) || [];
    
    return {
      id: job.id,
      title: job.title,
      department: job.department || undefined,
      total_candidates: jobCandidates.length,
      evaluated_candidates: Math.floor(jobCandidates.length * Math.random()), // Mock data
      pending_candidates: Math.floor(jobCandidates.length * (1 - Math.random())),
      average_score: Math.floor(70 + Math.random() * 25), // Mock data
      top_tier_count: Math.floor(jobCandidates.length * 0.2), // Mock data
    };
  }) || [];

  return (
    <AuthenticatedRoute>
      <DashboardLayout 
        title="Evaluation Center" 
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Evaluation Center' }
        ]}
      >
        <Container>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Evaluation Center
            </h1>
            <p className="text-gray-600">
              AI-powered candidate evaluation and assessment tools
            </p>
          </div>

        {/* Overview Metrics */}
        <OverviewMetrics />

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action) => (
              <QuickActionCard key={action.id} action={action} />
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Jobs with Evaluation Status */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Job Evaluation Status
            </h2>
            {jobsLoading || candidatesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <LoadingSpinner />
                  </Card>
                ))}
              </div>
            ) : jobSummaries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobSummaries.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No jobs available
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first job to start evaluating candidates
                </p>
                <Button onClick={() => window.location.href = '/dashboard/jobs/create'}>
                  Create Job
                </Button>
              </Card>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <RecentActivity />
          </div>
        </div>
      </Container>
    </DashboardLayout>
    </AuthenticatedRoute>
  );
}
