/**
 * Analytics Dashboard Component
 * Demonstrates usage of all analytics endpoints
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Lightbulb, 
  Activity,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

import { 
  useAdvancedAnalytics,
  useAnalyticsReports,
  useGenerateReport,
  useDismissInsight,
  useAnalyticsTracking
} from '@/hooks/analytics-advanced';

export function AnalyticsDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Use the comprehensive analytics hook
  const { overview, insights, usage, isLoading, error } = useAdvancedAnalytics();
  
  // Additional hooks for specific functionality
  const { data: reports } = useAnalyticsReports();
  const generateReport = useGenerateReport();
  const dismissInsight = useDismissInsight();
  const { trackUserAction } = useAnalyticsTracking();

  // Track tab changes
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    trackUserAction('analytics_tab_change', { tab: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load analytics data. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold">{overview.data?.jobs?.active || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                <p className="text-2xl font-bold">{overview.data?.candidates?.total || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time to Hire</p>
                <p className="text-2xl font-bold">{overview.data?.performance?.time_to_hire || 0} days</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hire Rate</p>
                <p className="text-2xl font-bold">{overview.data?.performance?.hire_rate || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Card>
        <CardHeader>
          <div className="flex space-x-2">
            {['overview', 'reports', 'insights', 'usage'].map((tab) => (
              <Button
                key={tab}
                variant={selectedTab === tab ? 'primary' : 'outline'}
                onClick={() => handleTabChange(tab)}
                className="capitalize"
              >
                {tab}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Tab Content */}
      <div className="space-y-6">
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Job Growth</span>
                    <Badge variant={overview.data?.trends?.job_growth && overview.data.trends.job_growth > 0 ? 'default' : 'secondary'}>
                      {overview.data?.trends?.job_growth || 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Candidate Growth</span>
                    <Badge variant={overview.data?.trends?.candidate_growth && overview.data.trends.candidate_growth > 0 ? 'default' : 'secondary'}>
                      {overview.data?.trends?.candidate_growth || 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Evaluation Trend</span>
                    <Badge variant={overview.data?.trends?.evaluation_trend && overview.data.trends.evaluation_trend > 0 ? 'default' : 'secondary'}>
                      {overview.data?.trends?.evaluation_trend || 0}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candidate Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Candidate Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New Candidates</span>
                    <span className="font-semibold">{overview.data?.candidates?.new || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Evaluated</span>
                    <span className="font-semibold">{overview.data?.candidates?.evaluated || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Shortlisted</span>
                    <span className="font-semibold">{overview.data?.candidates?.shortlisted || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'reports' && (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Analytics Reports</h3>
              <Button
                onClick={() => generateReport.mutate({
                  type: 'hiring',
                  date_range: {
                    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    end: new Date().toISOString()
                  }
                })}
                disabled={generateReport.isPending}
              >
                {generateReport.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Generate Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports?.map((report) => (
                <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">{report.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                        {report.status}
                      </Badge>
                      <span className="text-sm text-gray-500">{report.type}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{report.summary}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {selectedTab === 'insights' && (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">AI Insights</h3>
              <Badge variant="secondary">
                {insights.data?.length || 0} insights available
              </Badge>
            </div>

            <div className="space-y-4">
              {insights.data?.map((insight) => (
                <Card key={insight.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-5 w-5 text-blue-600" />
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge variant={insight.impact === 'high' ? 'error' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                            {insight.impact}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                          <span>•</span>
                          <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {!insight.dismissed && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => dismissInsight.mutate(insight.id)}
                        >
                          Dismiss
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {selectedTab === 'usage' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">API Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Requests</span>
                    <span className="font-semibold">{usage.data?.total_requests || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Unique Users</span>
                    <span className="font-semibold">{usage.data?.unique_users || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="font-semibold">
                      {usage.data?.performance_metrics?.error_rate || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="font-semibold">
                      {usage.data?.performance_metrics?.average_response_time || 0}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="font-semibold">
                      {usage.data?.performance_metrics?.uptime || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Feature Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {usage.data?.feature_usage && Object.entries(usage.data.feature_usage).map(([feature, count]) => (
                    <div key={feature} className="flex justify-between">
                      <span className="text-sm text-gray-600 capitalize">{feature}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}