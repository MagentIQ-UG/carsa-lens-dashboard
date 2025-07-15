/**
 * JobDetail Component
 * Complete job detail view with real data fetching
 */

'use client';

import { ArrowLeft, Edit2, Trash2, Eye, Share2, Pause, Play, MessageSquare, Users, Calendar, MapPin, DollarSign, Briefcase, Building } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { JobDescriptionRenderer } from '@/components/ui/job-description-renderer';
import { useJob, useDeleteJob, useJobDescriptions, useJobStats } from '@/hooks/jobs';
import { JobType, JobMode, SeniorityLevel, JobStatus } from '@/types/api';
import { formatSalaryRange } from '@/lib/utils';

interface JobDetailProps {
  jobId: string;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

// Helper functions
const getJobTypeLabel = (type: JobType): string => {
  const labels = {
    [JobType.FULL_TIME]: 'Full-time',
    [JobType.PART_TIME]: 'Part-time',
    [JobType.CONTRACT]: 'Contract',
    [JobType.TEMPORARY]: 'Temporary',
    [JobType.INTERNSHIP]: 'Internship',
    [JobType.FREELANCE]: 'Freelance',
  };
  return labels[type] || type;
};

const getJobModeLabel = (mode: JobMode): string => {
  const labels = {
    [JobMode.ON_SITE]: 'On-site',
    [JobMode.REMOTE]: 'Remote',
    [JobMode.HYBRID]: 'Hybrid',
  };
  return labels[mode] || mode;
};

const getSeniorityLabel = (level: SeniorityLevel): string => {
  const labels = {
    [SeniorityLevel.ENTRY]: 'Entry Level',
    [SeniorityLevel.JUNIOR]: 'Junior',
    [SeniorityLevel.MID]: 'Mid-level',
    [SeniorityLevel.SENIOR]: 'Senior',
    [SeniorityLevel.LEAD]: 'Lead',
    [SeniorityLevel.PRINCIPAL]: 'Principal',
    [SeniorityLevel.EXECUTIVE]: 'Executive',
  };
  return labels[level] || level;
};

const getStatusLabel = (status: JobStatus | string): string => {
  // Handle both enum values and potential backend string values
  const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : status;
  
  switch (normalizedStatus) {
    case JobStatus.ACTIVE:
    case 'active':
    case 'approved':
      return 'Active';
    case JobStatus.PAUSED:
    case 'paused':
      return 'Paused';
    case JobStatus.CLOSED:
    case 'closed':
      return 'Closed';
    case JobStatus.DRAFT:
    case 'draft':
    default:
      return 'Draft';
  }
};

const getStatusVariant = (status: JobStatus | string): 'default' | 'success' | 'warning' | 'error' => {
  const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : status;
  
  switch (normalizedStatus) {
    case JobStatus.ACTIVE:
    case 'active':
    case 'approved':
      return 'success';
    case JobStatus.PAUSED:
    case 'paused':
      return 'warning';
    case JobStatus.CLOSED:
    case 'closed':
      return 'error';
    case JobStatus.DRAFT:
    case 'draft':
    default:
      return 'default';
  }
};

export function JobDetail({ jobId, onBack, onEdit, onDelete, className }: JobDetailProps) {
  const { data: job, isLoading, isError, error } = useJob(jobId);
  const { data: jobDescriptions, isLoading: descriptionsLoading } = useJobDescriptions(jobId, false, !!jobId);
  const { data: jobStats, isLoading: statsLoading } = useJobStats(jobId);
  const deleteJobMutation = useDeleteJob();

  // Get the current/latest job description
  const currentDescription = jobDescriptions?.find(desc => desc.is_current) || jobDescriptions?.[0];

  const handleDelete = async () => {
    if (!job) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete the job "${job.title}"? This action cannot be undone.`
    );
    
    if (confirmed) {
      try {
        await deleteJobMutation.mutateAsync(job.id);
        onDelete?.();
      } catch {
        // Error is handled by the mutation hook
      }
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Loading Job Details</h3>
              <p className="text-gray-600">Please wait while we fetch the job information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="text-red-500">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {error?.message?.includes('Not authenticated') ? 'Authentication Required' : 'Job Not Found'}
              </h3>
              <p className="text-gray-600">
                {error?.message?.includes('Not authenticated') 
                  ? 'Please log in to view this job.' 
                  : 'The requested job could not be found or you don\'t have permission to view it.'
                }
              </p>
              {error && (
                <details className="mt-4 text-sm text-gray-500">
                  <summary className="cursor-pointer">Error Details</summary>
                  <pre className="mt-2 text-left bg-gray-50 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
              {error?.message?.includes('Not authenticated') && (
                <Button variant="primary" onClick={() => window.location.href = '/login'}>
                  Log In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Modern Header with Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 -mx-6 -mt-6 px-6 pt-6 pb-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="mt-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                <Badge 
                  variant={getStatusVariant(job.status)} 
                  className="text-sm px-3 py-1"
                >
                  {getStatusLabel(job.status)}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  {job.department}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {getJobTypeLabel(job.job_type as JobType)} • {getJobModeLabel(job.job_mode as JobMode)}
                </div>
                {(job.salary_min || job.salary_max) && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {formatSalaryRange(job.salary_min, job.salary_max, job.salary_currency)}
                  </div>
                )}
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                Created {new Date(job.created_at).toLocaleDateString()} • Updated {new Date(job.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            {job.status === JobStatus.ACTIVE ? (
              <Button variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            ) : job.status === JobStatus.PAUSED && (
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4 mr-1" />
                Activate
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Content - Job Description */}
        <div className="xl:col-span-3 space-y-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Job Description</CardTitle>
                {currentDescription && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Source: {currentDescription.source}</span>
                    {currentDescription.version && (
                      <span className="ml-2">• v{currentDescription.version}</span>
                    )}
                    {currentDescription.is_current && (
                      <Badge variant="outline" className="ml-2 text-xs">Current</Badge>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {descriptionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="md" />
                  <span className="ml-3 text-gray-600">Loading job description...</span>
                </div>
              ) : currentDescription?.content || job.description ? (
                <JobDescriptionRenderer
                  content={currentDescription?.content || job.description!}
                  title=""
                  compact={true}
                  showActions={false}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Description</h3>
                  <p className="text-gray-600 mb-4">This job doesn't have a description yet.</p>
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Add Description
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Metadata */}
          {job.job_metadata && Object.keys(job.job_metadata).length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(job.job_metadata).map(([key, value]) => (
                    <div key={key} className="border-l-4 border-blue-100 pl-4">
                      <span className="text-sm font-medium text-gray-500 block mb-1">
                        {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <p className="text-gray-900 font-medium">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Job Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {statsLoading ? '...' : jobStats?.applications || 0}
                  </div>
                  <div className="text-sm text-gray-600">Applications</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {statsLoading ? '...' : jobStats?.candidates || 0}
                  </div>
                  <div className="text-sm text-gray-600">Candidates</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">Seniority Level</span>
                    <p className="text-gray-900 font-medium">{getSeniorityLabel(job.seniority_level as SeniorityLevel)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">Employment Type</span>
                    <p className="text-gray-900 font-medium">{getJobTypeLabel(job.job_type as JobType)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">Work Mode</span>
                    <p className="text-gray-900 font-medium">{getJobModeLabel(job.job_mode as JobMode)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                View Applications
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Evaluation Results
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Share2 className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-red-600 hover:bg-red-50"
                onClick={handleDelete}
                disabled={deleteJobMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Job
              </Button>
            </CardContent>
          </Card>

          {/* Job Timeline */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-blue-100 pl-4">
                <span className="text-sm font-medium text-gray-500 block">Created</span>
                <p className="text-gray-900 font-medium">
                  {new Date(job.created_at).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="border-l-4 border-green-100 pl-4">
                <span className="text-sm font-medium text-gray-500 block">Last Updated</span>
                <p className="text-gray-900 font-medium">
                  {new Date(job.updated_at).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;
