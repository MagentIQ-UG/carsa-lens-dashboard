/**
 * Candidates Dashboard Page
 * Main candidate management interface with tabbed navigation
 */

'use client';

import { useState } from 'react';
import { 
  Users, 
  Upload, 
  List, 
  BarChart3, 
  Brain,
  Plus,
  Download,
  Eye
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import CandidateList from '@/components/candidates/candidate-list';
import CVUpload from '@/components/candidates/cv-upload';
import PipelineBoard from '@/components/candidates/pipeline-board';
import { APITester } from '@/components/debug/api-tester';

import { useCandidateStats } from '@/hooks/candidates';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { AuthGuard } from '@/components/auth/auth-guard';

type TabValue = 'overview' | 'upload' | 'pipeline' | 'debug';

export default function CandidatesPage() {
  return (
    <AuthGuard requireAuth={true}>
      <CandidatesContent />
    </AuthGuard>
  );
}

function CandidatesContent() {
  const [activeTab, setActiveTab] = useState<TabValue>('overview');

  const { data: stats, isLoading: statsLoading, error: statsError } = useCandidateStats();

  const tabs = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: List,
      description: 'View all candidates'
    },
    {
      id: 'upload' as const,
      label: 'Upload CVs',
      icon: Upload,
      description: 'Add new candidates'
    },
    {
      id: 'pipeline' as const,
      label: 'Pipeline',
      icon: BarChart3,
      description: 'Kanban view'
    },
    {
      id: 'debug' as const,
      label: 'API Debug',
      icon: Brain,
      description: 'Test API endpoints'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        try {
          return (
            <CandidateList />
          );
        } catch (error) {
          console.error('Error rendering CandidateList:', error);
          return (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-red-600 mb-4">⚠️ Error loading candidate list</div>
                <p className="text-gray-600">There was an issue loading the candidates.</p>
                <Button onClick={() => setActiveTab('overview')} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          );
        }
      case 'upload':
        return (
          <CVUpload
            onUploadComplete={(result) => {
              // Handle upload completion - switch to overview to see the new candidate
              if (process.env.NODE_ENV === 'development') {
                console.warn('✅ CV Upload completed:', result);
              }
              setActiveTab('overview');
            }}
          />
        );
      case 'pipeline':
        return (
          <PipelineBoard />
        );
      case 'debug':
        return <APITester />;
      default:
        return null;
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Candidates', href: '/dashboard/candidates', current: true }
  ];

  // Show loading state
  if (statsLoading) {
    return (
      <DashboardLayout title="Candidates" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading candidates...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (statsError) {
    return (
      <DashboardLayout title="Candidates" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">⚠️ Error loading candidates</div>
            <p className="text-gray-600">There was an issue loading the candidates page.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Reload Page
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Candidates" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Candidate Management
            </h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <Users className="h-4 w-4" />
              AI-powered candidate pipeline with profile extraction and management
            </p>
          </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/dashboard/candidates/analytics', '_blank')}
            className="group hover:shadow-md transition-all duration-200"
          >
            <BarChart3 className="h-4 w-4 mr-2 group-hover:text-blue-500 transition-colors" />
            Analytics
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/api/candidates/export', '_blank')}
            className="group hover:shadow-md transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2 group-hover:text-green-500 transition-colors" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() => setActiveTab('upload')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Candidates
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="glass" className="backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Candidates</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {stats?.total || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass" className="backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">This Week</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                    {stats?.this_week || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass" className="backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Processing</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                    {stats?.processing || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="h-6 w-6 text-white animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass" className="backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Completed</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    {stats?.completed || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <Card variant="glass" className="backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                      isActive && 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg',
                      !isActive && 'hover:bg-gray-100 hover:shadow-md'
                    )}
                  >
                    <IconComponent className={cn(
                      'h-4 w-4',
                      isActive && 'text-white',
                      !isActive && 'text-gray-600'
                    )} />
                    <span className={cn(
                      'font-medium',
                      isActive && 'text-white',
                      !isActive && 'text-gray-700'
                    )}>
                      {tab.label}
                    </span>
                  </Button>
                );
              })}
            </div>
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </div>
          </div>
        </CardHeader>
      </Card>

        {/* Tab Content */}
        <div className="animate-fade-in-up">
          {renderTabContent()}
        </div>
      </div>
    </DashboardLayout>
  );
}