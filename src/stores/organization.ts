/**
 * Organization Store
 * Multi-tenant organization management with Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { apiPost, apiGet, apiPut } from '@/lib/api/client';
import type { OrganizationResponse } from '@/types/api';

interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  email: string;
  first_name: string;
  last_name: string;
  joined_at: string;
  last_active: string;
}

interface OrganizationInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
  cancelled_at?: string;
  resent_count?: number;
  last_resent_at?: string;
  resent_history?: Array<{
    date: string;
    resent_by: string;
  }>;
}

interface OrganizationState {
  // Current organization state
  currentOrganization: OrganizationResponse | null;
  organizations: OrganizationResponse[];
  members: OrganizationMember[];
  invitations: OrganizationInvitation[];
  
  // Loading states
  isLoadingOrganizations: boolean;
  isLoadingMembers: boolean;
  isLoadingInvitations: boolean;
  isSwitchingOrganization: boolean;
  
  // Actions
  setCurrentOrganization: (organization: OrganizationResponse | null) => void;
  setOrganizations: (organizations: OrganizationResponse[]) => void;
  setMembers: (members: OrganizationMember[]) => void;
  setInvitations: (invitations: OrganizationInvitation[]) => void;
  
  // Async actions
  fetchOrganizations: () => Promise<void>;
  fetchCurrentOrganization: () => Promise<void>;
  fetchMembers: () => Promise<void>;
  fetchInvitations: () => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
  updateOrganization: (organizationId: string, data: Partial<OrganizationResponse>) => Promise<void>;
  inviteUser: (email: string, role: string) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  resendInvitation: (invitationId: string) => Promise<void>;
  
  // Utility functions
  hasPermission: (permission: string) => boolean;
  canManageUsers: () => boolean;
  canInviteUsers: () => boolean;
  getCurrentUserRole: () => string | null;
  
  // Cleanup
  clearOrganizationData: () => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentOrganization: null,
      organizations: [],
      members: [],
      invitations: [],
      isLoadingOrganizations: false,
      isLoadingMembers: false,
      isLoadingInvitations: false,
      isSwitchingOrganization: false,

      // Setters
      setCurrentOrganization: (organization) => {
        set({ currentOrganization: organization });
        
        // Store current organization ID in session storage for API middleware
        if (typeof window !== 'undefined') {
          if (organization) {
            sessionStorage.setItem('current_org_id', organization.id);
          } else {
            sessionStorage.removeItem('current_org_id');
          }
        }
      },

      setOrganizations: (organizations) => set({ organizations }),
      setMembers: (members) => set({ members }),
      setInvitations: (invitations) => set({ invitations }),

      // Async actions
      fetchOrganizations: async () => {
        set({ isLoadingOrganizations: true });
        try {
          const organizations = await apiGet<OrganizationResponse[]>('/organizations');
          set({ organizations, isLoadingOrganizations: false });
        } catch (error) {
          console.error('Failed to fetch organizations:', error);
          set({ isLoadingOrganizations: false });
        }
      },

      fetchCurrentOrganization: async () => {
        try {
          const organization = await apiGet<OrganizationResponse>('/organizations/current');
          get().setCurrentOrganization(organization);
        } catch (error) {
          console.error('Failed to fetch current organization:', error);
        }
      },

      fetchMembers: async () => {
        const { currentOrganization } = get();
        if (!currentOrganization) return;

        set({ isLoadingMembers: true });
        try {
          const members = await apiGet<OrganizationMember[]>(
            `/organizations/${currentOrganization.id}/members`
          );
          set({ members, isLoadingMembers: false });
        } catch (error) {
          console.error('Failed to fetch organization members:', error);
          set({ isLoadingMembers: false });
        }
      },

      fetchInvitations: async () => {
        const { currentOrganization } = get();
        if (!currentOrganization) return;

        set({ isLoadingInvitations: true });
        try {
          const invitations = await apiGet<OrganizationInvitation[]>(
            `/organizations/${currentOrganization.id}/invitations`
          );
          set({ invitations, isLoadingInvitations: false });
        } catch (error) {
          console.error('Failed to fetch invitations:', error);
          set({ isLoadingInvitations: false });
        }
      },

      switchOrganization: async (organizationId: string) => {
        set({ isSwitchingOrganization: true });
        try {
          await apiPost('/auth/switch-organization', { organization_id: organizationId });
          
          // Find and set the new current organization
          const { organizations } = get();
          const newOrganization = organizations.find(org => org.id === organizationId);
          if (newOrganization) {
            get().setCurrentOrganization(newOrganization);
          }
          
          // Refresh related data
          await Promise.all([
            get().fetchMembers(),
            get().fetchInvitations(),
          ]);
          
          set({ isSwitchingOrganization: false });
        } catch (error) {
          console.error('Failed to switch organization:', error);
          set({ isSwitchingOrganization: false });
          throw error;
        }
      },

      updateOrganization: async (organizationId: string, data: Partial<OrganizationResponse>) => {
        try {
          const updatedOrganization = await apiPut<OrganizationResponse>(
            `/organizations/${organizationId}`,
            data
          );
          
          // Update in organizations list
          const { organizations, currentOrganization } = get();
          const updatedOrganizations = organizations.map(org => 
            org.id === organizationId ? updatedOrganization : org
          );
          set({ organizations: updatedOrganizations });
          
          // Update current organization if it's the one being updated
          if (currentOrganization?.id === organizationId) {
            get().setCurrentOrganization(updatedOrganization);
          }
        } catch (error) {
          console.error('Failed to update organization:', error);
          throw error;
        }
      },

      inviteUser: async (email: string, role: string) => {
        const { currentOrganization } = get();
        if (!currentOrganization) throw new Error('No current organization');

        try {
          await apiPost(`/organizations/${currentOrganization.id}/invitations`, {
            email,
            role,
          });
          
          // Refresh invitations
          await get().fetchInvitations();
        } catch (error) {
          console.error('Failed to invite user:', error);
          throw error;
        }
      },

      removeUser: async (userId: string) => {
        const { currentOrganization } = get();
        if (!currentOrganization) throw new Error('No current organization');

        try {
          await apiPost(`/organizations/${currentOrganization.id}/members/${userId}/remove`);
          
          // Refresh members
          await get().fetchMembers();
        } catch (error) {
          console.error('Failed to remove user:', error);
          throw error;
        }
      },

      updateUserRole: async (userId: string, role: string) => {
        const { currentOrganization } = get();
        if (!currentOrganization) throw new Error('No current organization');

        try {
          await apiPut(`/organizations/${currentOrganization.id}/members/${userId}`, {
            role,
          });
          
          // Refresh members
          await get().fetchMembers();
        } catch (error) {
          console.error('Failed to update user role:', error);
          throw error;
        }
      },

      cancelInvitation: async (invitationId: string) => {
        const { currentOrganization } = get();
        if (!currentOrganization) throw new Error('No current organization');

        try {
          await apiPost(`/organizations/${currentOrganization.id}/invitations/${invitationId}/cancel`);
          
          // Refresh invitations
          await get().fetchInvitations();
        } catch (error) {
          console.error('Failed to cancel invitation:', error);
          throw error;
        }
      },

      resendInvitation: async (invitationId: string) => {
        const { currentOrganization } = get();
        if (!currentOrganization) throw new Error('No current organization');

        try {
          await apiPost(`/organizations/${currentOrganization.id}/invitations/${invitationId}/resend`);
          
          // Refresh invitations
          await get().fetchInvitations();
        } catch (error) {
          console.error('Failed to resend invitation:', error);
          throw error;
        }
      },

      // Utility functions
      hasPermission: (permission: string) => {
        // This would integrate with the auth store to check permissions
        // For now, simplified based on organization role
        const role = get().getCurrentUserRole();
        if (!role) return false;
        
        const rolePermissions: Record<string, string[]> = {
          'owner': ['*'],
          'admin': ['org:read', 'org:update', 'org:delete', 'org:manage_users', 'org:invite_users', 'org:manage_settings'],
          'manager': ['org:read', 'org:invite_users'],
          'member': ['org:read'],
        };
        
        const permissions = rolePermissions[role] || [];
        return permissions.includes('*') || permissions.includes(permission);
      },

      canManageUsers: () => get().hasPermission('org:manage_users'),
      canInviteUsers: () => get().hasPermission('org:invite_users'),

      getCurrentUserRole: () => {
        // This would get the current user's role in the current organization
        // In a real app, this would come from the auth context or API
        const { currentOrganization } = get();
        if (!currentOrganization) return null;
        
        // For now, we'll simulate getting the current user's role
        // In production, this would be retrieved from the auth context
        return 'admin'; // Placeholder - would be actual user role
      },

      clearOrganizationData: () => {
        set({
          currentOrganization: null,
          organizations: [],
          members: [],
          invitations: [],
          isLoadingOrganizations: false,
          isLoadingMembers: false,
          isLoadingInvitations: false,
          isSwitchingOrganization: false,
        });
        
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('current_org_id');
        }
      },
    }),
    {
      name: 'organization-store',
      serialize: {
        options: {
          // Redact sensitive data in devtools
          replacer: (key: string, value: unknown) => {
            if (key === 'members' && Array.isArray(value)) {
              return value.map(member => ({
                ...member,
                email: '[REDACTED]',
              }));
            }
            return value;
          },
        },
      },
    }
  )
);

// Selector hooks for better performance
export const useCurrentOrganization = () => 
  useOrganizationStore((state) => state.currentOrganization);

export const useOrganizations = () => 
  useOrganizationStore((state) => state.organizations);

export const useOrganizationMembers = () => 
  useOrganizationStore((state) => state.members);

export const useOrganizationInvitations = () => 
  useOrganizationStore((state) => state.invitations);

export const useOrganizationLoading = () => 
  useOrganizationStore((state) => ({
    isLoadingOrganizations: state.isLoadingOrganizations,
    isLoadingMembers: state.isLoadingMembers,
    isLoadingInvitations: state.isLoadingInvitations,
    isSwitchingOrganization: state.isSwitchingOrganization,
  }));