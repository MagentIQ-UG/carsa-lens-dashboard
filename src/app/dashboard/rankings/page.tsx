'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrophyIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  SparklesIcon,
  ArrowRightIcon,
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
import { useAllJobsRankings } from '@/hooks/rankings';
import { useJobs } from '@/hooks/jobs';

// Quick Actions for Rankings
const rankingActions = [
  {
    id: 'create-ranking',
    title: 'Create Advanced Ranking',
    description: 'Rank candidates with multi-criteria analysis',
    icon: TrophyIcon,
    color: 'bg-purple-500',
    href: '/dashboard/rankings/create',
  },
  {
    id: 'compare-rankings',
    title: 'Compare Rankings',
    description: 'Analyze different ranking approaches',
    icon: ChartBarIcon,
    color: 'bg-blue-500',
    href: '/dashboard/rankings/compare',
  },
  {
    id: 'diversity-report',
    title: 'Diversity Analytics',
    description: 'Review diversity metrics and bias analysis',
    icon: UserGroupIcon,
    color: 'bg-emerald-500',
    href: '/dashboard/rankings/diversity',
  },
  {
    id: 'decision-support',
    title: 'Decision Support',
    description: 'AI-powered hiring recommendations',
    icon: SparklesIcon,
    color: 'bg-orange-500',
    href: '/dashboard/rankings/insights',
  },
];

interface JobRankingSummary {
  id: string;
  title: string;
  department?: string;
  total_rankings: number;
  latest_ranking?: {
    id: string;
    created_at: string;
    total_candidates: number;
    top_tier_count: number;
  };
  status: 'active' | 'completed' | 'pending';
}

function RankingActionCard({ action }: { action: typeof rankingActions[0] }) {
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

function JobRankingCard({ job }: { job: JobRankingSummary }) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'primary';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircleIcon;
      case 'active': return ClockIcon;
      case 'pending': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const StatusIcon = getStatusIcon(job.status);

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
        <div className="flex items-center space-x-2">
          <StatusIcon className="w-5 h-5 text-gray-400" />
          <Badge variant={getStatusColor(job.status)}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Rankings</span>
          <span className="font-medium">{job.total_rankings}</span>
        </div>

        {job.latest_ranking && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Latest Ranking</span>
              <span className="font-medium">
                {new Date(job.latest_ranking.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Candidates Ranked</span>
              <span className="font-medium">{job.latest_ranking.total_candidates}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Top Tier</span>
              <span className="font-medium">{job.latest_ranking.top_tier_count}</span>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => router.push(`/dashboard/rankings/job/${job.id}`)}
          className="flex-1"
        >
          View Rankings
          <ArrowRightIcon className="w-4 h-4 ml-1" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/dashboard/rankings/create?job=${job.id}`)}
        >
          New Ranking
        </Button>
      </div>
    </Card>
  );
}

function RankingOverviewMetrics() {
  const { data: rankings = [], isLoading: rankingsLoading, isError: rankingsError } = useAllJobsRankings();
  const { data: jobs, isLoading: jobsLoading } = useJobs();

  if (rankingsLoading || jobsLoading) {
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

  const totalRankings = rankingsError ? 0 : rankings.length;
  const totalJobs = jobs?.length || 0;
  // Mock data for status counts since RankingResponse doesn't have status
  const activeRankings = Math.floor(totalRankings * 0.3);
  const completedRankings = Math.floor(totalRankings * 0.7);

  const metrics = [
    {
      title: 'Total Rankings',
      value: totalRankings,
      icon: TrophyIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Active Jobs',
      value: totalJobs,
      icon: DocumentChartBarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'In Progress',
      value: activeRankings,
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Completed',
      value: completedRankings,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
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

function RecentRankings() {
  const { data: rankings = [], isLoading, isError } = useAllJobsRankings();

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Rankings</h3>
        <LoadingSpinner />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Rankings</h3>
        <div className="text-center py-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-600">Error loading rankings</p>
          <p className="text-sm text-gray-500 mt-1">Rankings endpoint may not be configured yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Rankings</h3>
      {rankings && rankings.length > 0 ? (
        <div className="space-y-3">
          {rankings.slice(0, 5).map((ranking, index) => (
            <div key={ranking.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Ranking #{ranking.rank || index + 1}
                </p>
                <p className="text-sm text-gray-600">
                  Job: {ranking.job_id?.slice(0, 8)}... • Score: {ranking.score?.toFixed(1) || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <Badge 
                  variant="primary"
                  size="sm"
                >
                  Rank #{ranking.rank || index + 1}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <TrophyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No rankings created yet</p>
          <p className="text-sm text-gray-500">Create your first ranking to see insights here</p>
        </div>
      )}
    </Card>
  );
}

export default function RankingsPage() {
  const { data: jobs, isLoading: jobsLoading } = useJobs();

  // Create job ranking summaries
  const jobRankings: JobRankingSummary[] = jobs?.map(job => ({
    id: job.id,
    title: job.title,
    department: job.department || undefined,
    total_rankings: Math.floor(Math.random() * 5) + 1, // Mock data
    latest_ranking: Math.random() > 0.3 ? {
      id: `ranking_${job.id}`,
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      total_candidates: Math.floor(Math.random() * 20) + 5,
      top_tier_count: Math.floor(Math.random() * 5) + 1,
    } : undefined,
    status: ['active', 'completed', 'pending'][Math.floor(Math.random() * 3)] as any,
  })) || [];

  return (
    <AuthenticatedRoute>
      <DashboardLayout 
        title="Rankings & Decision Making" 
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Rankings' }
        ]}
      >
        <Container>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rankings & Decision Making
            </h1>
            <p className="text-gray-600">
              Advanced candidate ranking, analytics, and decision support tools
            </p>
          </div>

        {/* Overview Metrics */}
        <RankingOverviewMetrics />

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rankingActions.map((action) => (
              <RankingActionCard key={action.id} action={action} />
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Rankings */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Job Rankings
            </h2>
            {jobsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <LoadingSpinner />
                  </Card>
                ))}
              </div>
            ) : jobRankings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobRankings.map((job) => (
                  <JobRankingCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No job rankings yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create rankings to compare and evaluate candidates
                </p>
                <Button onClick={() => window.location.href = '/dashboard/rankings/create'}>
                  Create Ranking
                </Button>
              </Card>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <RecentRankings />
          </div>
        </div>
      </Container>
    </DashboardLayout>
    </AuthenticatedRoute>
  );
}
