/**
 * Page Header Component
 * Professional page header with title, breadcrumbs, and actions
 * Responsive design with flexible content areas
 */

import React from 'react';

import { cn } from '@/lib/utils';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  children,
  className
}) => {
  return (
    <div className={cn('bg-white border-b border-gray-200', className)}>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="py-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        {/* Main Header */}
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl sm:truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>
            
            {actions && (
              <div className="flex items-center space-x-3 ml-4">
                {actions}
              </div>
            )}
          </div>

          {/* Additional Content */}
          {children && (
            <div className="mt-6">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Pre-built action components for common use cases
interface HeaderActionsProps {
  primaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
  };
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
    disabled?: boolean;
  }>;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  primaryAction,
  secondaryActions = []
}) => {
  return (
    <div className="flex items-center space-x-3">
      {secondaryActions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'outline'}
          onClick={action.onClick}
          disabled={action.disabled}
          size="sm"
        >
          {action.label}
        </Button>
      ))}
      
      {primaryAction && (
        <Button
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled || primaryAction.loading}
          size="sm"
        >
          {primaryAction.loading ? 'Loading...' : primaryAction.label}
        </Button>
      )}
    </div>
  );
};

export { PageHeader, HeaderActions };
export type { PageHeaderProps, HeaderActionsProps };