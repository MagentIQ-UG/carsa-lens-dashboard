/**
 * Job Creation Page
 * Dedicated page for creating new jobs
 */

'use client';

// Force dynamic rendering since this page uses auth context
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { AuthenticatedRoute } from '@/components/auth/protected-route';
import { JobWizard } from '@/components/jobs/job-wizard';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { JobResponse } from '@/types/api';

function JobCreateContent() {
  const router = useRouter();
  const [showWizard] = useState(true);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Jobs', href: '/dashboard/jobs' },
    { label: 'Create Job', href: '/dashboard/jobs/create', current: true }
  ];

  const handleWizardClose = () => {
    router.push('/dashboard/jobs');
  };

  const handleWizardSuccess = (job: JobResponse) => {
    router.push(`/dashboard/jobs/${job.id}`);
  };

  return (
    <DashboardLayout title="Create New Job" breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Create a New Job Posting
          </h1>
          <p className="text-gray-600 mb-8">
            Use our step-by-step wizard to create a comprehensive job posting that attracts the right candidates.
          </p>
        </div>

        <JobWizard
          isOpen={showWizard}
          onClose={handleWizardClose}
          onSuccess={handleWizardSuccess}
        />
      </div>
    </DashboardLayout>
  );
}

export default function JobCreatePage() {
  return (
    <AuthenticatedRoute>
      <JobCreateContent />
    </AuthenticatedRoute>
  );
}