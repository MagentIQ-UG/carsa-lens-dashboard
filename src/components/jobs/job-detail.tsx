/**
 * JobDetail Component
 * Complete job detail view with real data fetching
 */

'use client';

import { ArrowLeft, Edit2, Trash2, Eye, Share2, Pause, Play } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { useJob, useDeleteJob } from '@/hooks/jobs';
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

const getStatusVariant = (status: JobStatus): 'default' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case JobStatus.ACTIVE:
      return 'success';
    case JobStatus.PAUSED:
      return 'warning';
    case JobStatus.CLOSED:
      return 'error';
    case JobStatus.DRAFT:
    default:
      return 'default';
  }
};

export function JobDetail({ jobId, onBack, onEdit, onDelete, className }: JobDetailProps) {
  const { data: job, isLoading, isError } = useJob(jobId);
  const deleteJobMutation = useDeleteJob();

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
              <h3 className="text-lg font-medium text-gray-900">Job Not Found</h3>
              <p className="text-gray-600">The requested job could not be found or you don't have permission to view it.</p>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <Badge variant={getStatusVariant(job.status as JobStatus)}>
                {job.status}
              </Badge>
            </div>
            <p className="text-gray-600">
              {job.department} • {job.location} • {getJobTypeLabel(job.job_type as JobType)}
            </p>
          </div>
        </div>

        {/* Actions */}
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
          ) : (
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-1" />
              Activate
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            disabled={deleteJobMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              {job.description ? (
                <div className="prose prose-sm max-w-none">
                  {job.description.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('##')) {
                      return (
                        <h3 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                          {paragraph.replace('##', '').trim()}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith('•')) {
                      return (
                        <li key={index} className="ml-4">
                          {paragraph.replace('•', '').trim()}
                        </li>
                      );
                    }
                    if (paragraph.trim()) {
                      return (
                        <p key={index} className="mb-4 text-gray-700">
                          {paragraph.trim()}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Description Available</h3>
                  <p className="text-gray-600">This job doesn't have a description yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Metadata */}
          {job.job_metadata && Object.keys(job.job_metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(job.job_metadata).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-sm font-medium text-gray-500 block">
                        {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <p className="text-gray-900">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500 block">Status</span>
                <Badge variant={getStatusVariant(job.status as JobStatus)} className="mt-1">
                  {job.status}
                </Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 block">Job Type</span>
                <p className="text-gray-900">{getJobTypeLabel(job.job_type as JobType)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 block">Work Mode</span>
                <p className="text-gray-900">{getJobModeLabel(job.job_mode as JobMode)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 block">Seniority Level</span>
                <p className="text-gray-900">{getSeniorityLabel(job.seniority_level as SeniorityLevel)}</p>
              </div>
              {(job.salary_min || job.salary_max) && (
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Salary Range</span>
                  <p className="text-gray-900">
                    {formatSalaryRange(job.salary_min, job.salary_max, job.salary_currency)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500 block">Created</span>
                <p className="text-gray-900">
                  {new Date(job.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 block">Last Updated</span>
                <p className="text-gray-900">
                  {new Date(job.updated_at).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                View Candidates
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Evaluation Results
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Export Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;
