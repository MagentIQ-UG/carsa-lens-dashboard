/**
 * Dashboard Page
 * Protected route requiring authentication
 */

'use client';

// Force dynamic rendering since this page uses auth context
export const dynamic = 'force-dynamic';

import { AuthenticatedRoute } from '@/components/auth/protected-route';
import { CompactOrganizationOverview } from '@/components/organization/organization-overview';
import { OrganizationSwitcher } from '@/components/organization/organization-switcher';
import { useAuth } from '@/lib/auth/context';
import { useOrganization } from '@/lib/organization/context';

function DashboardContent() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Organization Switcher */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to CARSA Lens Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Enterprise recruitment management platform
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <OrganizationSwitcher showCreateOption={true} />
            </div>
          </div>
          
          {/* Organization Overview */}
          {currentOrganization && (
            <div className="mb-6">
              <CompactOrganizationOverview />
            </div>
          )}
        </div>

        {/* User Info Card */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            User Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.email}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <p className="mt-1 text-sm text-gray-900 capitalize">
                {user?.role}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user?.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Jobs
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Manage job postings and requirements
            </p>
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              View Jobs
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Candidates
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Review candidate profiles and applications
            </p>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              View Candidates
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Evaluations
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              AI-powered candidate evaluations
            </p>
            <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
              View Evaluations
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analytics
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Hiring metrics and insights
            </p>
            <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthenticatedRoute>
      <DashboardContent />
    </AuthenticatedRoute>
  );
}