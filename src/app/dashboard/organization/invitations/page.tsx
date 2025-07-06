/**
 * Organization Invitations Page
 * Complete interface for managing organization invitations
 */

'use client';

// Force dynamic rendering since this page uses auth context
export const dynamic = 'force-dynamic';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthenticatedRoute } from '@/components/auth/protected-route';
import { InvitationManagement } from '@/components/organization/invitation-management';
import { InviteUserModal } from '@/components/organization/invite-user-modal';
import { CompactOrganizationSwitcher } from '@/components/organization/organization-switcher';
import { Button } from '@/components/ui/button';

function OrganizationInvitationsContent() {
  const router = useRouter();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleInviteSuccess = () => {
    // The InvitationManagement component will automatically refresh
    // when the organization store updates
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  Organization Invitations
                </h1>
                <p className="text-gray-600">
                  Track and manage invitation status for your organization
                </p>
              </div>
            </div>
            <CompactOrganizationSwitcher />
          </div>
        </div>

        {/* Invitation Management */}
        <InvitationManagement 
          showCreateButton={true}
          onCreateClick={() => setShowInviteModal(true)}
          maxInvitations={100}
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

export default function OrganizationInvitationsPage() {
  return (
    <AuthenticatedRoute requiredPermissions={['org:read']}>
      <OrganizationInvitationsContent />
    </AuthenticatedRoute>
  );
}