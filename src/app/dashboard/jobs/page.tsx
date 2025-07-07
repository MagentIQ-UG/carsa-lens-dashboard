/**
 * Jobs Dashboard Page
 * Main jobs management interface
 */

'use client';

// Force dynamic rendering since this page uses auth context
export const dynamic = 'force-dynamic';

import React from 'react';

import { AuthenticatedRoute } from '@/components/auth/protected-route';
import { JobList } from '@/components/jobs/job-list';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';

function JobsContent() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Jobs', href: '/dashboard/jobs', current: true }
  ];

  return (
    <DashboardLayout title="Jobs Management" breadcrumbs={breadcrumbs}>
      <JobList />
    </DashboardLayout>
  );
}

export default function JobsPage() {
  return (
    <AuthenticatedRoute>
      <JobsContent />
    </AuthenticatedRoute>
  );
}