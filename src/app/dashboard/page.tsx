/**
 * Dashboard Page
 * Executive dashboard with clean layout following enterprise best practices
 */

'use client';

// Force dynamic rendering since this page uses auth context
export const dynamic = 'force-dynamic';

import { 
  Users, 
  Briefcase, 
  ClipboardList, 
  Activity,
  TrendingUp,
  UserCheck,
  Clock,
  Target,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useMemo } from 'react';

import { AuthenticatedRoute } from '@/components/auth/protected-route';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { NavigationGrid } from '@/components/dashboard/navigation-grid';
import { PerformanceChart } from '@/components/dashboard/performance-chart';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { OrganizationSwitcher } from '@/components/organization/organization-switcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { MetricsCard } from '@/components/ui/metrics-card';
import { useAnalyticsMetrics } from '@/hooks/analytics';
import { useAuth } from '@/lib/auth/context';
import { useOrganization } from '@/lib/organization/context';

function DashboardContent() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { metrics: analyticsMetrics, isLoading: metricsLoading } = useAnalyticsMetrics();

  // Memoize metrics with analytics data
  const primaryMetrics = useMemo(() => {
    if (!analyticsMetrics) {
      // Fallback metrics while loading
      return [
        {
          title: 'Active Jobs',
          value: 12,
          subtitle: 'Open positions',
          icon: <Briefcase className="h-5 w-5" />,
          trend: { value: 15.2, direction: 'up' as const, label: 'vs last month' }
        },
        {
          title: 'Total Candidates',
          value: 248,
          subtitle: 'In pipeline',
          icon: <Users className="h-5 w-5" />,
          trend: { value: 8.1, direction: 'up' as const, label: 'vs last month' }
        },
        {
          title: 'Time to Hire',
          value: 18,
          subtitle: 'Average days',
          icon: <Clock className="h-5 w-5" />,
          trend: { value: 2.1, direction: 'down' as const, label: 'improvement' }
        },
        {
          title: 'Hire Success Rate',
          value: 24.5,
          subtitle: 'Placement percentage',
          icon: <Target className="h-5 w-5" />,
          trend: { value: 3.2, direction: 'up' as const, label: 'vs last month' }
        }
      ];
    }

    // Map analytics data to metrics with icons
    return analyticsMetrics.map((metric, index) => ({
      ...metric,
      icon: [
        <Briefcase className="h-5 w-5" key="briefcase" />,
        <Users className="h-5 w-5" key="users" />,
        <Clock className="h-5 w-5" key="clock" />,
        <Target className="h-5 w-5" key="target" />
      ][index]
    }));
  }, [analyticsMetrics]);

  // Sample chart data for performance visualization
  const hiringTrendData = useMemo(() => [
    { name: 'Jan', value: 45, secondary: 32 },
    { name: 'Feb', value: 52, secondary: 38 },
    { name: 'Mar', value: 48, secondary: 42 },
    { name: 'Apr', value: 61, secondary: 49 },
    { name: 'May', value: 55, secondary: 45 },
    { name: 'Jun', value: 67, secondary: 52 }
  ], []);

  const evaluationDistributionData = useMemo(() => [
    { name: 'Excellent (90+)', value: 15 },
    { name: 'Good (80-89)', value: 45 },
    { name: 'Average (70-79)', value: 35 },
    { name: 'Below Average', value: 5 }
  ], []);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard', current: true }
  ];

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout title="Dashboard" breadcrumbs={breadcrumbs}>
      <Container size="full" className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {getGreeting()}, {user?.first_name || 'there'}!
            </h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Here's what's happening with your recruitment pipeline today.
            </p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>📅 {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
              <span className="mx-2">•</span>
              <span>🏢 {currentOrganization?.name || 'Your Organization'}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-4 lg:mt-0">
            <Button size="sm" className="hidden sm:flex">
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
            <OrganizationSwitcher showCreateOption={false} />
          </div>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {primaryMetrics.map((metric, index) => (
            <MetricsCard
              key={index}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              icon={metric.icon}
              trend={metric.trend}
              loading={metricsLoading}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Charts Section */}
          <div className="lg:col-span-8">
            <div className="space-y-8">
              {/* Primary Chart */}
              <PerformanceChart
                title="Hiring Trends"
                type="line"
                data={hiringTrendData}
                height={350}
                showControls={true}
                showTrend={true}
                primaryColor="#3B82F6"
                secondaryColor="#10B981"
              />
              
              {/* Secondary Charts */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <PerformanceChart
                  title="Evaluation Distribution"
                  type="pie"
                  data={evaluationDistributionData}
                  height={300}
                  showControls={false}
                  showTrend={false}
                />
                
                <PerformanceChart
                  title="Monthly Progress"
                  type="bar"
                  data={hiringTrendData.slice(-4)}
                  height={300}
                  showControls={false}
                  showTrend={true}
                  primaryColor="#8B5CF6"
                />
              </div>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="lg:col-span-4">
            <div className="space-y-6">
              {/* Activity Feed */}
              <ActivityFeed
                title="Recent Activity"
                maxItems={6}
                showHeader={true}
                realTime={true}
              />

              {/* Quick Actions Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Quick Actions
                    </h3>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Create New Job
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Upload Candidates
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Run Evaluation
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Current Status */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">
                    This Week
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Interviews</span>
                      </div>
                      <span className="text-sm font-medium">12 scheduled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ClipboardList className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">Evaluations</span>
                      </div>
                      <span className="text-sm font-medium">8 completed</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-purple-500" />
                        <span className="text-sm text-gray-600">Applications</span>
                      </div>
                      <span className="text-sm font-medium">24 new</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Quick Navigation - Collapsed by default, expandable */}
        <div className="border-t pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Explore Features
            </h2>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          <NavigationGrid
            title=""
            showHeader={false}
            columns={4}
          />
        </div>
      </Container>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <AuthenticatedRoute>
      <DashboardContent />
    </AuthenticatedRoute>
  );
}