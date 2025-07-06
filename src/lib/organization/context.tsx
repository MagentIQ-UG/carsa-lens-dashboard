/**
 * Organization Context
 * Multi-tenant organization management context
 */

'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';

import { useAuth } from '@/lib/auth/context';
import { useOrganizationStore } from '@/stores/organization';
import type { OrganizationResponse } from '@/types/api';

interface OrganizationContextType {
  currentOrganization: OrganizationResponse | null;
  organizations: OrganizationResponse[];
  isLoading: boolean;
  switchOrganization: (organizationId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  canManageUsers: () => boolean;
  canInviteUsers: () => boolean;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { isAuthenticated, user, initialized } = useAuth();
  const {
    currentOrganization,
    organizations,
    isLoadingOrganizations,
    isSwitchingOrganization,
    fetchOrganizations,
    fetchCurrentOrganization,
    switchOrganization,
    hasPermission,
    canManageUsers,
    canInviteUsers,
    clearOrganizationData,
  } = useOrganizationStore();

  // Initialize organization data when user is authenticated
  useEffect(() => {
    if (initialized && isAuthenticated && user) {
      // For now, we'll skip fetching organization data since:
      // 1. The API spec shows limited organization endpoints
      // 2. Organization data is already available in the login response
      // 3. This prevents API errors from cluttering the console
      // Organization context ready (using auth context data)
    } else if (initialized && !isAuthenticated) {
      // Clear organization data when user logs out
      clearOrganizationData();
    }
  }, [
    initialized,
    isAuthenticated,
    user,
    clearOrganizationData,
  ]);

  const refreshOrganizations = async (): Promise<void> => {
    await fetchOrganizations();
    await fetchCurrentOrganization();
  };

  const contextValue: OrganizationContextType = {
    currentOrganization,
    organizations,
    isLoading: isLoadingOrganizations || isSwitchingOrganization,
    switchOrganization,
    refreshOrganizations,
    hasPermission,
    canManageUsers,
    canInviteUsers,
  };

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

// Helper hooks for common organization operations
export function useCurrentOrganizationId(): string | null {
  const { currentOrganization } = useOrganization();
  return currentOrganization?.id || null;
}

export function useOrganizationPermissions() {
  const { hasPermission, canManageUsers, canInviteUsers } = useOrganization();
  return {
    hasPermission,
    canManageUsers,
    canInviteUsers,
  };
}

export function useOrganizationSwitcher() {
  const { organizations, currentOrganization, switchOrganization, isLoading } = useOrganization();
  
  return {
    organizations,
    currentOrganization,
    switchOrganization,
    isLoading,
    availableOrganizations: organizations.filter(org => org.id !== currentOrganization?.id),
  };
}