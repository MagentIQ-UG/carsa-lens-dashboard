/**
 * Invitation Management Component
 * Comprehensive interface for managing organization invitations
 */

'use client';

import { Mail, Clock, CheckCircle, XCircle, RefreshCw, Send, Calendar, User, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useOrganizationPermissions } from '@/lib/organization/context';
import { cn } from '@/lib/utils';
import { useCurrentOrganization, useOrganizationInvitations, useOrganizationLoading, useOrganizationStore } from '@/stores/organization';
import { UserRole } from '@/types/api';

interface InvitationManagementProps {
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  maxInvitations?: number;
}

interface InvitationWithDetails {
  id: string;
  organization_id: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
  cancelled_at?: string;
  resent_count?: number;
  last_resent_at?: string;
}

export function InvitationManagement({ 
  showCreateButton = true, 
  onCreateClick,
  maxInvitations = 50 
}: InvitationManagementProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'expired' | 'cancelled'>('all');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvitations, setSelectedInvitations] = useState<Set<string>>(new Set());
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);

  const currentOrganization = useCurrentOrganization();
  const invitations = useOrganizationInvitations() as InvitationWithDetails[];
  const { isLoadingInvitations } = useOrganizationLoading();
  const { cancelInvitation, resendInvitation } = useOrganizationStore();
  const { canInviteUsers, hasPermission } = useOrganizationPermissions();

  const canManageInvitations = hasPermission('org:invite_users');

  // Status configuration
  const statusConfig = {
    pending: {
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
      description: 'Invitation sent, awaiting response'
    },
    accepted: {
      label: 'Accepted',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      description: 'User has joined the organization'
    },
    expired: {
      label: 'Expired',
      color: 'bg-red-100 text-red-800',
      icon: XCircle,
      description: 'Invitation has expired'
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-gray-100 text-gray-800',
      icon: XCircle,
      description: 'Invitation was cancelled'
    }
  };

  // Role configuration
  const roleConfig = {
    [UserRole.OWNER]: { label: 'Owner', color: 'bg-purple-100 text-purple-800' },
    [UserRole.ADMIN]: { label: 'Admin', color: 'bg-blue-100 text-blue-800' },
    [UserRole.HR]: { label: 'HR Manager', color: 'bg-green-100 text-green-800' },
    [UserRole.USER]: { label: 'User', color: 'bg-gray-100 text-gray-800' }
  };

  // Filter invitations
  const filteredInvitations = useMemo(() => {
    return invitations.filter(invitation => {
      const matchesSearch = searchTerm === '' || 
        invitation.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter;
      const matchesRole = roleFilter === 'all' || invitation.role === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [invitations, searchTerm, statusFilter, roleFilter]);

  // Calculate invitation statistics
  const invitationStats = useMemo(() => {
    const total = invitations.length;
    const pending = invitations.filter(inv => inv.status === 'pending').length;
    const accepted = invitations.filter(inv => inv.status === 'accepted').length;
    const expired = invitations.filter(inv => inv.status === 'expired').length;
    const cancelled = invitations.filter(inv => inv.status === 'cancelled').length;
    
    return { total, pending, accepted, expired, cancelled };
  }, [invitations]);

  // Check if invitation is about to expire (within 24 hours)
  const isInvitationExpiringSoon = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
  };

  // Handle individual invitation actions
  const handleResendInvitation = async (invitationId: string, email: string) => {
    try {
      await resendInvitation(invitationId);
      toast.success(`Invitation resent to ${email}`);
    } catch (error) {
      toast.error('Failed to resend invitation');
      console.error('Resend invitation error:', error);
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
      setSelectedInvitations(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitationId);
        return newSet;
      });
    } catch (error) {
      toast.error('Failed to cancel invitation');
      console.error('Cancel invitation error:', error);
    }
  };

  // Handle bulk actions
  const handleBulkCancel = async () => {
    if (selectedInvitations.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel ${selectedInvitations.size} selected invitation(s)?`
    );
    
    if (!confirmed) return;

    setIsPerformingBulkAction(true);
    const successCount = [];
    const errorCount = [];

    try {
      for (const invitationId of selectedInvitations) {
        try {
          await cancelInvitation(invitationId);
          successCount.push(invitationId);
        } catch (error) {
          errorCount.push(invitationId);
          console.error(`Failed to cancel invitation ${invitationId}:`, error);
        }
      }

      if (successCount.length > 0) {
        toast.success(`${successCount.length} invitation(s) cancelled successfully`);
      }
      if (errorCount.length > 0) {
        toast.error(`Failed to cancel ${errorCount.length} invitation(s)`);
      }

      setSelectedInvitations(new Set());
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  const handleBulkResend = async () => {
    if (selectedInvitations.size === 0) return;

    const pendingInvitations = Array.from(selectedInvitations).filter(id =>
      invitations.find(inv => inv.id === id && inv.status === 'pending')
    );

    if (pendingInvitations.length === 0) {
      toast.error('No pending invitations selected');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to resend ${pendingInvitations.length} pending invitation(s)?`
    );
    
    if (!confirmed) return;

    setIsPerformingBulkAction(true);
    const successCount = [];
    const errorCount = [];

    try {
      for (const invitationId of pendingInvitations) {
        try {
          await resendInvitation(invitationId);
          successCount.push(invitationId);
        } catch (error) {
          errorCount.push(invitationId);
          console.error(`Failed to resend invitation ${invitationId}:`, error);
        }
      }

      if (successCount.length > 0) {
        toast.success(`${successCount.length} invitation(s) resent successfully`);
      }
      if (errorCount.length > 0) {
        toast.error(`Failed to resend ${errorCount.length} invitation(s)`);
      }

      setSelectedInvitations(new Set());
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  // Handle invitation selection
  const handleSelectInvitation = (invitationId: string) => {
    setSelectedInvitations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(invitationId)) {
        newSet.delete(invitationId);
      } else {
        newSet.add(invitationId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedInvitations.size === filteredInvitations.length) {
      setSelectedInvitations(new Set());
    } else {
      setSelectedInvitations(new Set(filteredInvitations.map(inv => inv.id)));
    }
  };

  if (!currentOrganization) {
    return (
      <div className="p-6 text-center">
        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Organization Selected
        </h3>
        <p className="text-gray-600">
          Please select an organization to manage invitations.
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
            <Mail className="h-6 w-6 mr-2" />
            Invitation Management
          </h2>
          <p className="text-gray-600 mt-1">
            Track and manage organization invitations
          </p>
        </div>
        
        {showCreateButton && canInviteUsers() && (
          <Button
            onClick={onCreateClick}
            leftIcon={<Send className="h-4 w-4" />}
            className="mt-4 sm:mt-0"
          >
            Send Invitation
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{invitationStats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{invitationStats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{invitationStats.accepted}</div>
          <div className="text-sm text-gray-600">Accepted</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{invitationStats.expired}</div>
          <div className="text-sm text-gray-600">Expired</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">{invitationStats.cancelled}</div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'accepted' | 'expired' | 'cancelled')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="lg:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.HR}>HR Manager</option>
              <option value={UserRole.USER}>User</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedInvitations.size > 0 && canManageInvitations && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedInvitations.size} invitation(s) selected
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkResend}
                  disabled={isPerformingBulkAction}
                  leftIcon={isPerformingBulkAction ? <LoadingSpinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
                >
                  Resend
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkCancel}
                  disabled={isPerformingBulkAction}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invitations List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Invitations ({filteredInvitations.length})
            </h3>
            {filteredInvitations.length > 0 && canManageInvitations && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedInvitations.size === filteredInvitations.length && filteredInvitations.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Select All</label>
              </div>
            )}
          </div>
        </div>

        {isLoadingInvitations ? (
          <div className="p-6 text-center">
            <LoadingSpinner size="md" />
            <p className="text-gray-600 mt-2">Loading invitations...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredInvitations.map((invitation) => {
              const StatusIcon = statusConfig[invitation.status].icon;
              const isExpiringSoon = invitation.status === 'pending' && isInvitationExpiringSoon(invitation.expires_at);
              
              return (
                <div key={invitation.id} className={cn(
                  'p-6 hover:bg-gray-50',
                  isExpiringSoon && 'bg-yellow-50'
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Selection Checkbox */}
                      {canManageInvitations && (
                        <input
                          type="checkbox"
                          checked={selectedInvitations.has(invitation.id)}
                          onChange={() => handleSelectInvitation(invitation.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      )}

                      {/* Invitation Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {invitation.email}
                          </h4>
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            roleConfig[invitation.role].color
                          )}>
                            {roleConfig[invitation.role].label}
                          </span>
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            statusConfig[invitation.status].color
                          )}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[invitation.status].label}
                          </span>
                          {isExpiringSoon && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Expires Soon
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Sent: {new Date(invitation.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            By: {invitation.invited_by}
                          </div>
                        </div>

                        {invitation.resent_count && invitation.resent_count > 0 && (
                          <div className="mt-1 text-xs text-gray-500">
                            Resent {invitation.resent_count} time(s)
                            {invitation.last_resent_at && (
                              <span> (last: {new Date(invitation.last_resent_at).toLocaleDateString()})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {canManageInvitations && (
                      <div className="flex items-center space-x-2">
                        {invitation.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvitation(invitation.id, invitation.email)}
                            leftIcon={<RefreshCw className="h-4 w-4" />}
                          >
                            Resend
                          </Button>
                        )}
                        
                        {(invitation.status === 'pending' || invitation.status === 'expired') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {filteredInvitations.length === 0 && (
              <div className="p-6 text-center">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No invitations found
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'No invitations have been sent yet.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invitation Limit Warning */}
      {invitationStats.total >= maxInvitations * 0.8 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">
              You have used {invitationStats.total} of {maxInvitations} available invitations. 
              {invitationStats.total >= maxInvitations && ' You have reached the invitation limit.'}
            </p>
          </div>
        </div>
      )}

      {/* Permission Warning */}
      {!canManageInvitations && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">
              You have read-only access to invitation management. Contact your administrator to manage invitations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}