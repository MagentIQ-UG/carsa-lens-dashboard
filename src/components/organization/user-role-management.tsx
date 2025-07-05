/**
 * User Role Management Component
 * Comprehensive interface for managing organization members and their roles
 */

'use client';

import { Search, UserPlus, MoreVertical, Shield, Mail, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useOrganizationPermissions } from '@/lib/organization/context';
import { cn } from '@/lib/utils';
import { useCurrentOrganization, useOrganizationMembers, useOrganizationInvitations, useOrganizationLoading, useOrganizationStore } from '@/stores/organization';
import { UserRole } from '@/types/api';

interface UserRoleManagementProps {
  showInviteButton?: boolean;
  onInviteClick?: () => void;
}

interface MemberWithRole {
  id: string;
  user_id: string;
  organization_id: string;
  role: UserRole;
  status: 'active' | 'pending' | 'inactive';
  email: string;
  first_name: string;
  last_name: string;
  joined_at: string;
  last_active: string;
}

interface InvitationWithRole {
  id: string;
  organization_id: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invited_by: string;
  created_at: string;
  expires_at: string;
}

export function UserRoleManagement({ 
  showInviteButton = true, 
  onInviteClick 
}: UserRoleManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);

  const currentOrganization = useCurrentOrganization();
  const members = useOrganizationMembers() as MemberWithRole[];
  const invitations = useOrganizationInvitations() as InvitationWithRole[];
  const { isLoadingMembers, isLoadingInvitations } = useOrganizationLoading();
  const { updateUserRole, removeUser, cancelInvitation, resendInvitation } = useOrganizationStore();
  const { canManageUsers, hasPermission } = useOrganizationPermissions();

  const canManageRoles = hasPermission('org:manage_users');
  const canInviteUsers = hasPermission('org:invite_users');

  // Role display configuration
  const roleConfig = {
    [UserRole.OWNER]: {
      label: 'Owner',
      color: 'bg-purple-100 text-purple-800',
      description: 'Full access to all organization features'
    },
    [UserRole.ADMIN]: {
      label: 'Admin',
      color: 'bg-blue-100 text-blue-800',
      description: 'Manage users, settings, and most features'
    },
    [UserRole.HR]: {
      label: 'HR Manager',
      color: 'bg-green-100 text-green-800',
      description: 'Manage jobs, candidates, and evaluations'
    },
    [UserRole.USER]: {
      label: 'User',
      color: 'bg-gray-100 text-gray-800',
      description: 'Basic access to recruitment features'
    }
  };

  // Filter and search logic
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = searchTerm === '' || 
        member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, searchTerm, roleFilter, statusFilter]);

  const filteredInvitations = useMemo(() => {
    return invitations.filter(invitation => {
      const matchesSearch = searchTerm === '' || 
        invitation.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || invitation.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'pending' && invitation.status === 'pending');
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [invitations, searchTerm, roleFilter, statusFilter]);

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    setIsUpdatingRole(memberId);
    try {
      await updateUserRole(memberId, newRole);
      toast.success('User role updated successfully');
    } catch (error) {
      toast.error('Failed to update user role');
      console.error('Role update error:', error);
    } finally {
      setIsUpdatingRole(null);
      setSelectedMember(null);
    }
  };

  const handleRemoveUser = async (memberId: string, memberName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${memberName} from the organization?`
    );
    
    if (!confirmed) return;

    try {
      await removeUser(memberId);
      toast.success('User removed successfully');
    } catch (error) {
      toast.error('Failed to remove user');
      console.error('Remove user error:', error);
    }
  };

  const handleCancelInvitation = async (invitationId: string, email: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel the invitation for ${email}?`
    );
    
    if (!confirmed) return;

    try {
      await cancelInvitation(invitationId);
      toast.success('Invitation cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel invitation');
      console.error('Cancel invitation error:', error);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await resendInvitation(invitationId);
      toast.success('Invitation resent successfully');
    } catch (error) {
      toast.error('Failed to resend invitation');
      console.error('Resend invitation error:', error);
    }
  };

  if (!currentOrganization) {
    return (
      <div className="p-6 text-center">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Organization Selected
        </h3>
        <p className="text-gray-600">
          Please select an organization to manage users.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            User Role Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage organization members and their permissions
          </p>
        </div>
        
        {showInviteButton && canInviteUsers && (
          <Button
            onClick={onInviteClick}
            leftIcon={<UserPlus className="h-4 w-4" />}
            className="mt-4 sm:mt-0"
          >
            Invite User
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="sm:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value={UserRole.OWNER}>Owner</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.HR}>HR Manager</option>
              <option value={UserRole.USER}>User</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'pending' | 'inactive')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Organization Members ({filteredMembers.length + filteredInvitations.length})
          </h3>
        </div>

        {isLoadingMembers || isLoadingInvitations ? (
          <div className="p-6 text-center">
            <LoadingSpinner size="md" />
            <p className="text-gray-600 mt-2">Loading members...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Active Members */}
            {filteredMembers.map((member) => (
              <div key={member.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                      </span>
                    </div>

                    {/* Member Info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </h4>
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          roleConfig[member.role].color
                        )}>
                          {roleConfig[member.role].label}
                        </span>
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          member.status === 'active' ? 'bg-green-100 text-green-800' :
                          member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        )}>
                          {member.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <p className="text-xs text-gray-500">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {canManageRoles && member.role !== UserRole.OWNER && (
                    <div className="flex items-center space-x-2">
                      {/* Role Selector */}
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user_id, e.target.value as UserRole)}
                        disabled={isUpdatingRole === member.user_id}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={UserRole.ADMIN}>Admin</option>
                        <option value={UserRole.HR}>HR Manager</option>
                        <option value={UserRole.USER}>User</option>
                      </select>

                      {/* More Actions */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>

                        {selectedMember === member.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setSelectedMember(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                              <div className="py-1">
                                <button
                                  onClick={() => handleRemoveUser(member.user_id, `${member.first_name} ${member.last_name}`)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  Remove from organization
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {isUpdatingRole === member.user_id && (
                        <LoadingSpinner size="sm" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Pending Invitations */}
            {filteredInvitations.map((invitation) => (
              <div key={invitation.id} className="p-6 hover:bg-gray-50 bg-yellow-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-yellow-600" />
                    </div>

                    {/* Invitation Info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {invitation.email}
                        </h4>
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          roleConfig[invitation.role].color
                        )}>
                          {roleConfig[invitation.role].label}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending Invitation
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Invited {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Expires {new Date(invitation.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Invitation Actions */}
                  {canManageRoles && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendInvitation(invitation.id)}
                      >
                        Resend
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Empty State */}
            {filteredMembers.length === 0 && filteredInvitations.length === 0 && (
              <div className="p-6 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No members found
                </h3>
                <p className="text-gray-600">
                  {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'Start by inviting users to your organization.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Permission Warning */}
      {!canManageUsers && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">
              You have read-only access to user management. Contact your administrator to manage user roles.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}