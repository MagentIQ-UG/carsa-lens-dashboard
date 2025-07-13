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
  ArrowRight,
  Sparkles,
  Zap,
  BarChart3,
  Search,
  Bell,
  Settings,
  Download
} from 'lucide-react';
import { useMemo } from 'react';

import { AuthenticatedRoute } from '@/components/auth/protected-route';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { NavigationGrid } from '@/components/dashboard/navigation-grid';
import { PerformanceChart } from '@/components/dashboard/performance-chart';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { OrganizationSwitcher } from '@/components/organization/organization-switcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { useAnalyticsMetrics } from '@/hooks/analytics';
import { useAuth } from '@/lib/auth/context';

function DashboardContent() {
  const { user } = useAuth();
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
        {/* Modern Header with AI Assistant */}
        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-2xl -z-10" />
          
          <Card variant="glass" className="border-white/20 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-muted-foreground">AI Assistant Active</span>
                    </div>
                    <div className="w-px h-4 bg-border" />
                    <span className="text-xs text-muted-foreground">
                      📅 {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl mb-2">
                    {getGreeting()}, {user?.first_name || 'there'}! 
                    <Sparkles className="inline h-6 w-6 ml-2 text-secondary animate-pulse" />
                  </h1>
                  
                  <p className="text-muted-foreground text-base mb-4">
                    Your recruitment pipeline is performing exceptionally well. Here are today's insights.
                  </p>
                  
                  {/* AI Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="glass" size="sm" className="h-8 btn-interactive micro-bounce hover-float">
                      <Zap className="h-3 w-3 mr-2 ai-pulse" />
                      AI Insights
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 micro-tap hover-lift">
                      <BarChart3 className="h-3 w-3 mr-2" />
                      Analytics
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 micro-tap hover-lift">
                      <Download className="h-3 w-3 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6 lg:mt-0 lg:ml-6">
                  <div className="flex items-center gap-3">
                    {/* AI Search */}
                    <div className="hidden md:block">
                      <Input
                        placeholder="Ask AI anything..."
                        variant="search"
                        size="sm"
                        className="w-64"
                        leftIcon={<Search className="h-4 w-4" />}
                      />
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon-sm" className="micro-bounce hover-scale morph-circle-to-square">
                        <Bell className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" className="micro-bounce hover-scale morph-circle-to-square">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Primary CTA */}
                    <Button variant="gradient" size="lg" className="shadow-elevation-3 btn-interactive micro-tap hover-float">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Job
                    </Button>
                    
                    <OrganizationSwitcher showCreateOption={false} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-grid">
          {primaryMetrics.map((metric, index) => (
            <Card
              key={index}
              variant={index === 0 ? "feature" : "interactive"}
              className={`group animate-zoom-in hover-float micro-interaction ${index === 0 ? 'border-primary/30 hover-pulse-glow' : 'hover-tilt'}`}
              style={{ animationDelay: `${index * 100}ms` }}
              animate={true}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      index === 0 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'
                    } transition-colors duration-200`}>
                      {metric.icon}
                    </div>
                  </div>
                  {metric.trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      metric.trend.direction === 'up' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      <TrendingUp className={`h-3 w-3 ${metric.trend.direction === 'down' ? 'rotate-180' : ''}`} />
                      {metric.trend.value}%
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {metricsLoading ? (
                        <div className="w-16 h-8 bg-muted rounded animate-pulse" />
                      ) : (
                        metric.value
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {metric.subtitle}
                    </span>
                  </div>
                  {metric.trend && (
                    <p className="text-xs text-muted-foreground">
                      {metric.trend.label}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Modern Charts Section */}
          <div className="lg:col-span-8 space-y-6">
            {/* AI-Enhanced Primary Chart */}
            <Card variant="elevated" className="overflow-hidden animate-slide-in-left hover-lift micro-interaction">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Hiring Trends
                      <span className="ml-2 px-2 py-1 text-xs bg-secondary/10 text-secondary rounded-full">
                        AI Enhanced
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Real-time insights with predictive analytics
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <PerformanceChart
                  title=""
                  type="line"
                  data={hiringTrendData}
                  height={350}
                  showControls={true}
                  showTrend={true}
                  primaryColor="hsl(var(--primary))"
                  secondaryColor="hsl(var(--secondary))"
                />
              </CardContent>
            </Card>
            
            {/* Secondary Analytics Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 stagger-grid">
              <Card variant="interactive" className="overflow-hidden group animate-flip-in hover-tilt micro-interaction">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-secondary" />
                    Evaluation Distribution
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Quality assessment breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <PerformanceChart
                    title=""
                    type="pie"
                    data={evaluationDistributionData}
                    height={280}
                    showControls={false}
                    showTrend={false}
                  />
                </CardContent>
              </Card>
              
              <Card variant="interactive" className="overflow-hidden group animate-rotate-in hover-tilt micro-interaction">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Monthly Progress
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Recent performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <PerformanceChart
                    title=""
                    type="bar"
                    data={hiringTrendData.slice(-4)}
                    height={280}
                    showControls={false}
                    showTrend={true}
                    primaryColor="hsl(var(--secondary))"
                  />
                </CardContent>
              </Card>
            </div>

            {/* AI Insights Panel */}
            <Card variant="feature" className="border-secondary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-secondary/10">
                    <Sparkles className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      AI-Powered Insights
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Your hiring velocity has increased by 24% this month. Based on current trends, 
                      you're on track to exceed your quarterly targets by 15%.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm">
                        View Predictions
                      </Button>
                      <Button variant="outline" size="sm">
                        Configure AI
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Modern Activity Feed */}
            <Card variant="elevated" className="overflow-hidden animate-slide-in-right hover-lift micro-interaction">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Activity
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1" />
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
                <CardDescription>
                  Real-time updates from your recruitment pipeline
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ActivityFeed
                  title=""
                  maxItems={6}
                  showHeader={false}
                  realTime={true}
                />
              </CardContent>
            </Card>

            {/* AI-Powered Quick Actions */}
            <Card variant="interactive" className="group animate-zoom-in hover-float micro-interaction">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-secondary" />
                    Quick Actions
                    <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                      AI Suggested
                    </span>
                  </CardTitle>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="gradient" 
                    size="sm" 
                    className="w-full justify-start btn-interactive micro-tap hover-float"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Create New Job
                    <span className="ml-auto text-xs opacity-75">⌘+N</span>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start hover-lift micro-bounce">
                    <Users className="h-4 w-4 mr-2" />
                    Upload Candidates
                    <span className="ml-auto text-xs text-muted-foreground">⌘+U</span>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start hover-lift micro-bounce">
                    <ClipboardList className="h-4 w-4 mr-2 ai-breathe" />
                    Run AI Evaluation
                    <span className="ml-auto text-xs text-muted-foreground">⌘+E</span>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start hover-lift micro-bounce">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                    <span className="ml-auto text-xs text-muted-foreground">⌘+A</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Performance Summary */}
            <Card variant="gradient" className="overflow-hidden animate-slide-in-bottom hover-tilt micro-interaction">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  This Week's Performance
                </CardTitle>
                <CardDescription>
                  Your recruitment activities at a glance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <UserCheck className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">Interviews</span>
                        <p className="text-xs text-muted-foreground">Scheduled & completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-foreground">12</span>
                      <p className="text-xs text-green-600">+3 this week</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary/10">
                        <ClipboardList className="h-4 w-4 text-secondary" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">AI Evaluations</span>
                        <p className="text-xs text-muted-foreground">Processed by AI</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-foreground">8</span>
                      <p className="text-xs text-green-600">100% accuracy</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                        <Activity className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">Applications</span>
                        <p className="text-xs text-muted-foreground">New submissions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-foreground">24</span>
                      <p className="text-xs text-green-600">+18% vs last week</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border/50">
                  <Button variant="outline" size="sm" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Detailed Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 md:hidden z-50">
          <Button variant="fab" size="icon-xl" className="shadow-elevation-6 hover:shadow-elevation-5 btn-interactive micro-tap ai-breathe morph-circle-to-square">
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Enhanced Feature Navigation */}
        <Card variant="ghost" className="mt-8 animate-fade-in-up page-enter">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-secondary ai-pulse" />
                  Explore Features
                </CardTitle>
                <CardDescription>
                  Discover powerful tools to streamline your recruitment
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="hover-lift micro-bounce">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="stagger-grid">
              <NavigationGrid
                title=""
                showHeader={false}
                columns={4}
              />
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