/**
 * Organization Settings Page
 * Dedicated page for organization settings management
 */

'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Force dynamic rendering since this page uses auth context
export const dynamic = 'force-dynamic';

import { AuthenticatedRoute } from '@/components/auth/protected-route';
import { OrganizationSettings } from '@/components/organization/organization-settings';
import { CompactOrganizationSwitcher } from '@/components/organization/organization-switcher';
import { Button } from '@/components/ui/button';

function OrganizationSettingsContent() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Organization Settings
                </h1>
                <p className="text-gray-600">
                  Manage your organization's profile and configuration
                </p>
              </div>
            </div>
            <CompactOrganizationSwitcher />
          </div>
        </div>

        {/* Settings Interface */}
        <OrganizationSettings 
          showHeader={false}
          onSave={() => {
            // Optional: redirect or show success message
          }}
        />
      </div>
    </div>
  );
}

export default function OrganizationSettingsPage() {
  return (
    <AuthenticatedRoute requiredPermissions={['org:read']}>
      <OrganizationSettingsContent />
    </AuthenticatedRoute>
  );
}