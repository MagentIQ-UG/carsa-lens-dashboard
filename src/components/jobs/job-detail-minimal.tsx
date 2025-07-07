/**
 * JobDetail Component
 * Minimal job detail view for build compatibility
 */

'use client';

import { ArrowLeft } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { JobResponse } from '@/types/api';

interface JobDetailProps {
  jobId: string;
  onBack?: () => void;
  className?: string;
}

export function JobDetail({ jobId, onBack, className }: JobDetailProps) {
  // Mock job data for now
  const job: JobResponse = {
    id: jobId,
    title: 'Loading...',
    description: 'Loading job details...',
    department: '',
    location: '',
    job_type: 'full_time' as any,
    job_mode: 'on_site' as any,
    seniority_level: 'mid' as any,
    salary_min: 0,
    salary_max: 0,
    salary_currency: 'USD',
    status: 'active' as any,
    is_active: true,
    organization_id: '',
    created_by_id: '',
    job_metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-600">{job.department} • {job.location}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Job Description</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{job.description || 'No description available'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Status</span>
                <p className="text-gray-900">{job.status}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Type</span>
                <p className="text-gray-900">{job.job_type}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Mode</span>
                <p className="text-gray-900">{job.job_mode}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;
