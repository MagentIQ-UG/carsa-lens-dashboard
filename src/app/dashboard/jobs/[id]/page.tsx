/**
 * Job Detail Page
 * Individual job view and management
 */

'use client';

// Force dynamic rendering since this page uses auth context
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import React, { use } from 'react';

import { AuthenticatedRoute } from '@/components/auth/protected-route';
import { JobDetail } from '@/components/jobs/job-detail';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { useJob } from '@/hooks/jobs';

interface JobDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function JobDetailContent({ jobId }: { jobId: string }) {
  const router = useRouter();
  const { data: job } = useJob(jobId);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Jobs', href: '/dashboard/jobs' },
    { label: job?.title || 'Job Details', href: `/dashboard/jobs/${jobId}`, current: true }
  ];

  const handleBack = () => {
    router.push('/dashboard/jobs');
  };

  const handleEdit = () => {
    router.push(`/dashboard/jobs/${jobId}/edit`);
  };

  const handleDelete = () => {
    // Handle deletion and redirect
    router.push('/dashboard/jobs');
  };

  return (
    <DashboardLayout title={job?.title || 'Job Details'} breadcrumbs={breadcrumbs}>
      <JobDetail
        jobId={jobId}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = use(params);
  
  return (
    <AuthenticatedRoute>
      <JobDetailContent jobId={id} />
    </AuthenticatedRoute>
  );
}