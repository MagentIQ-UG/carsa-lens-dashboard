/**
 * Organization Members Page
 * Complete interface for managing organization members, roles, and invitations
 */

'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthenticatedRoute } from '@/components/auth/protected-route';
import { InviteUserModal } from '@/components/organization/invite-user-modal';
import { CompactOrganizationSwitcher } from '@/components/organization/organization-switcher';
import { UserRoleManagement } from '@/components/organization/user-role-management';
import { Button } from '@/components/ui/button';

// Force dynamic rendering since this page uses auth context
export const dynamic = 'force-dynamic';

function OrganizationMembersContent() {
  const router = useRouter();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleInviteSuccess = () => {
    // The UserRoleManagement component will automatically refresh
    // when the organization store updates
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  Organization Members
                </h1>
                <p className="text-gray-600">
                  Manage your team members and their permissions
                </p>
              </div>
            </div>
            <CompactOrganizationSwitcher />
          </div>
        </div>

        {/* User Role Management */}
        <UserRoleManagement 
          showInviteButton={true}
          onInviteClick={() => setShowInviteModal(true)}
        />

        {/* Invite User Modal */}
        <InviteUserModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      </div>
    </div>
  );
}

export default function OrganizationMembersPage() {
  return (
    <AuthenticatedRoute requiredPermissions={['org:read']}>
      <OrganizationMembersContent />
    </AuthenticatedRoute>
  );
}