/**
 * Job Creation Page
 * AI-powered job creation with comprehensive wizard
 */

'use client';

// Force dynamic rendering since this page uses auth context
export const dynamic = 'force-dynamic';

import { AuthenticatedRoute } from '@/components/auth/protected-route';
import { JobCreationWizard } from '@/components/jobs/job-creation-wizard';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';

function JobCreateContent() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Jobs', href: '/dashboard/jobs' },
    { label: 'Create Job', href: '/dashboard/jobs/create', current: true }
  ];

  return (
    <DashboardLayout title="Create New Job" breadcrumbs={breadcrumbs}>
      <JobCreationWizard />
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