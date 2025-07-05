/**
 * Organization Overview Component
 * Displays current organization information and quick stats
 */

'use client';

import { Building2, Users, Mail, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useCurrentOrganization, useOrganizationMembers, useOrganizationInvitations, useOrganizationLoading } from '@/stores/organization';

interface OrganizationOverviewProps {
  showActions?: boolean;
  onEditClick?: () => void;
  onMembersClick?: () => void;
  onSettingsClick?: () => void;
}

export function OrganizationOverview({
  showActions = true,
  onEditClick,
  onMembersClick,
  onSettingsClick,
}: OrganizationOverviewProps) {
  const router = useRouter();
  const currentOrganization = useCurrentOrganization();
  const members = useOrganizationMembers();
  const invitations = useOrganizationInvitations();
  const { isLoadingMembers, isLoadingInvitations } = useOrganizationLoading();

  const handleEditClick = () => {
    if (onEditClick) {
      onEditClick();
    } else {
      router.push('/dashboard/organization/settings');
    }
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      router.push('/dashboard/organization/settings');
    }
  };

  const handleMembersClick = () => {
    if (onMembersClick) {
      onMembersClick();
    } else {
      router.push('/dashboard/organization/members');
    }
  };

  if (!currentOrganization) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Organization Selected
          </h3>
          <p className="text-gray-600">
            Please select an organization to view details.
          </p>
        </div>
      </div>
    );
  }

  const activeMembers = members.filter(member => member.status === 'active').length;
  const pendingInvitations = invitations.filter(invitation => invitation.status === 'pending').length;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center h-12 w-12 bg-white bg-opacity-20 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {currentOrganization.name}
              </h2>
              {currentOrganization.description && (
                <p className="text-blue-100 text-sm">
                  {currentOrganization.description}
                </p>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-30"
              >
                <Settings className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Organization Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Organization Details
            </h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-gray-500">Organization ID</dt>
                <dd className="text-sm text-gray-900 font-mono">{currentOrganization.id}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Slug</dt>
                <dd className="text-sm text-gray-900">{currentOrganization.slug}</dd>
              </div>
              {currentOrganization.website && (
                <div>
                  <dt className="text-xs text-gray-500">Website</dt>
                  <dd className="text-sm text-blue-600">
                    <a 
                      href={currentOrganization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {currentOrganization.website}
                    </a>
                  </dd>
                </div>
              )}
              {currentOrganization.industry && (
                <div>
                  <dt className="text-xs text-gray-500">Industry</dt>
                  <dd className="text-sm text-gray-900">{currentOrganization.industry}</dd>
                </div>
              )}
              {currentOrganization.size && (
                <div>
                  <dt className="text-xs text-gray-500">Company Size</dt>
                  <dd className="text-sm text-gray-900 capitalize">
                    {currentOrganization.size.replace('_', ' ')}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(currentOrganization.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Quick Stats
            </h3>
            <div className="space-y-3">
              {/* Members */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Active Members</span>
                </div>
                <div className="flex items-center space-x-2">
                  {isLoadingMembers ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <span className="text-sm font-semibold text-gray-900">
                      {activeMembers}
                    </span>
                  )}
                  {showActions && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMembersClick}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>

              {/* Pending Invitations */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Pending Invitations</span>
                </div>
                <div className="flex items-center space-x-2">
                  {isLoadingInvitations ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <span className="text-sm font-semibold text-gray-900">
                      {pendingInvitations}
                    </span>
                  )}
                  {showActions && pendingInvitations > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/dashboard/organization/invitations')}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleMembersClick}
              variant="outline"
              leftIcon={<Users className="h-4 w-4" />}
            >
              Manage Members
            </Button>
            <Button
              onClick={handleSettingsClick}
              variant="outline"
              leftIcon={<Settings className="h-4 w-4" />}
            >
              Organization Settings
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for sidebars
export function CompactOrganizationOverview() {
  const currentOrganization = useCurrentOrganization();

  if (!currentOrganization) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <Building2 className="h-6 w-6 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600">No organization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center h-8 w-8 bg-blue-100 rounded-lg">
          <Building2 className="h-4 w-4 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {currentOrganization.name}
          </p>
          <p className="text-xs text-gray-500">
            {currentOrganization.slug}
          </p>
        </div>
      </div>
    </div>
  );
}