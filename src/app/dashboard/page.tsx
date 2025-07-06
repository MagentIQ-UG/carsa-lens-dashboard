/**
 * Dashboard Page
 * Protected route requiring authentication
 */

'use client';

// Force dynamic rendering since this page uses auth context
export const dynamic = 'force-dynamic';

import { AuthenticatedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { MetricsCard } from '@/components/ui/metrics-card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompactOrganizationOverview } from '@/components/organization/organization-overview';
import { OrganizationSwitcher } from '@/components/organization/organization-switcher';
import { useAuth } from '@/lib/auth/context';
import { useOrganization } from '@/lib/organization/context';
import { 
  Users, 
  Briefcase, 
  ClipboardList, 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

function DashboardContent() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  // Mock metrics data
  const metrics = [
    {
      title: 'Active Jobs',
      value: 12,
      subtitle: 'Open positions',
      icon: <Briefcase className="h-5 w-5" />,
      trend: { value: 15.2, direction: 'up' as const, label: 'vs last month' }
    },
    {
      title: 'Candidates',
      value: 248,
      subtitle: 'In pipeline',
      icon: <Users className="h-5 w-5" />,
      trend: { value: 8.1, direction: 'up' as const, label: 'vs last month' }
    },
    {
      title: 'Evaluations',
      value: 36,
      subtitle: 'Completed this month',
      icon: <ClipboardList className="h-5 w-5" />,
      trend: { value: 12.3, direction: 'down' as const, label: 'vs last month' }
    },
    {
      title: 'Hire Rate',
      value: 24.5,
      subtitle: 'Success percentage',
      icon: <BarChart3 className="h-5 w-5" />,
      trend: { value: 3.2, direction: 'up' as const, label: 'vs last month' }
    }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard', current: true }
  ];

  return (
    <DashboardLayout title="Dashboard Overview" breadcrumbs={breadcrumbs}>
      <Container size="full">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.first_name}!
              </h1>
              <p className="mt-1 text-gray-600">
                Here's what's happening with your recruitment pipeline
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <OrganizationSwitcher showCreateOption={true} />
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricsCard
              key={index}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              icon={metric.icon}
              trend={metric.trend}
            />
          ))}
        </div>

        {/* Organization Overview */}
        {currentOrganization && (
          <div className="mb-8">
            <CompactOrganizationOverview />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Profile
                </h2>
                <Badge variant={user?.is_active ? 'success' : 'destructive'}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium">
                    {user?.first_name} {user?.last_name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {user?.role}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New job posted: Senior Developer</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">5 new candidates evaluated</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Evaluation completed for Marketing Manager</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                <Briefcase className="h-6 w-6" />
                <span>Create Job</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                <Users className="h-6 w-6" />
                <span>Add Candidates</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                <ClipboardList className="h-6 w-6" />
                <span>Run Evaluation</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span>View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
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