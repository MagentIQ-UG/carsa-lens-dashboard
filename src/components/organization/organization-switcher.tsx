/**
 * Organization Switcher Component
 * Allows users to switch between organizations they have access to
 */

'use client';

import { Check, ChevronDown, Building2, Plus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useOrganizationSwitcher } from '@/lib/organization/context';
import { cn } from '@/lib/utils';

interface OrganizationSwitcherProps {
  className?: string;
  showCreateOption?: boolean;
}

export function OrganizationSwitcher({ 
  className,
  showCreateOption = false 
}: OrganizationSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    organizations, 
    currentOrganization, 
    switchOrganization, 
    isLoading 
  } = useOrganizationSwitcher();

  const handleSwitchOrganization = async (organizationId: string) => {
    if (organizationId === currentOrganization?.id) {
      setIsOpen(false);
      return;
    }

    try {
      await switchOrganization(organizationId);
      toast.success('Organization switched successfully');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to switch organization');
      console.error('Organization switch error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <LoadingSpinner size="sm" />
        <span className="text-sm text-gray-600">Loading organizations...</span>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Building2 className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-600">No organizations</span>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full min-w-48 max-w-64"
        disabled={isLoading}
      >
        <div className="flex items-center space-x-2 truncate">
          <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="truncate">
            {currentOrganization?.name || 'Select Organization'}
          </span>
        </div>
        <ChevronDown 
          className={cn(
            'h-4 w-4 text-gray-500 transition-transform flex-shrink-0',
            isOpen && 'transform rotate-180'
          )} 
        />
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-64 overflow-auto">
            <div className="py-1">
              {/* Current Organization */}
              {currentOrganization && (
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Current Organization
                </div>
              )}
              
              {organizations.map((organization) => (
                <button
                  key={organization.id}
                  onClick={() => handleSwitchOrganization(organization.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50',
                    currentOrganization?.id === organization.id && 'bg-blue-50'
                  )}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {organization.name}
                      </div>
                      {organization.description && (
                        <div className="text-xs text-gray-500 truncate">
                          {organization.description}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {currentOrganization?.id === organization.id && (
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}

              {/* Create new organization option */}
              {showCreateOption && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      // TODO: Open create organization modal
                      toast('Create organization feature coming soon');
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Create new organization</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Compact version for navigation bars
export function CompactOrganizationSwitcher({ className }: { className?: string }) {
  const { currentOrganization } = useOrganizationSwitcher();

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Building2 className="h-4 w-4 text-gray-500" />
      <span className="text-sm font-medium text-gray-900 truncate">
        {currentOrganization?.name || 'No Organization'}
      </span>
    </div>
  );
}

// Organization badge for display purposes
export function OrganizationBadge({ 
  organization, 
  size = 'md',
  className 
}: { 
  organization: { name: string; id: string };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full bg-blue-100 text-blue-800 font-medium',
      sizeClasses[size],
      className
    )}>
      <Building2 className={cn(
        'mr-1.5',
        size === 'sm' && 'h-3 w-3',
        size === 'md' && 'h-4 w-4',
        size === 'lg' && 'h-5 w-5'
      )} />
      {organization.name}
    </span>
  );
}