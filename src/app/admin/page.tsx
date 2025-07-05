/**
 * Admin Page
 * Protected route requiring admin role
 */

'use client';

import { AdminRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';

function AdminContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Administration Panel
          </h1>
          <p className="mt-2 text-gray-600">
            System administration and configuration
          </p>
        </div>

        {/* Admin Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Administrator Access
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Welcome, {user?.first_name}!</strong> You have administrator access to this system.
            </p>
            <p className="text-blue-600 text-sm mt-1">
              Role: {user?.role} | Organization: {user?.organization_id}
            </p>
          </div>
        </div>

        {/* Admin Functions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              User Management
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Manage user accounts, roles, and permissions
            </p>
            <button className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
              Manage Users
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              System Settings
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Configure system-wide settings and preferences
            </p>
            <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
              System Config
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Audit Logs
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              View system activity and security logs
            </p>
            <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors">
              View Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminContent />
    </AdminRoute>
  );
}