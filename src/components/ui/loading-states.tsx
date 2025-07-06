/**
 * Loading States Components
 * Professional loading indicators with enterprise design
 * Covers various loading scenarios
 */

import { Loader2, RefreshCw } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

import { Card, CardContent, CardHeader } from './card';
import { Skeleton } from './skeleton';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

interface PageLoadingProps {
  title?: string;
  description?: string;
}

interface CardLoadingProps {
  lines?: number;
  showHeader?: boolean;
  showFooter?: boolean;
}

interface TableLoadingProps {
  rows?: number;
  columns?: number;
}

const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

// Enhanced Loading Spinner
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text 
}) => {
  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <Loader2 className={cn('animate-spin text-blue-600', spinnerSizes[size])} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
};

// Refresh Loading Indicator
export const RefreshLoading: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text = 'Refreshing...'
}) => {
  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <RefreshCw className={cn('animate-spin text-blue-600', spinnerSizes[size])} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
};

// Full Page Loading
export const PageLoading: React.FC<PageLoadingProps> = ({ 
  title = 'Loading...',
  description = 'Please wait while we load your content.'
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
};

// Card Loading Skeleton
export const CardLoading: React.FC<CardLoadingProps> = ({ 
  lines = 3,
  showHeader = true,
  showFooter = false
}) => {
  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <Skeleton variant="text" width="60%" height="20px" />
          <Skeleton variant="text" width="40%" height="16px" />
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: lines }, (_, index) => (
            <Skeleton 
              key={index}
              variant="text" 
              width={index === lines - 1 ? '75%' : '100%'} 
              height="16px" 
            />
          ))}
        </div>
      </CardContent>
      {showFooter && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Skeleton variant="text" width="30%" height="16px" />
          <Skeleton variant="rounded" width="80px" height="32px" />
        </div>
      )}
    </Card>
  );
};

// Table Loading Skeleton
export const TableLoading: React.FC<TableLoadingProps> = ({ 
  rows = 5,
  columns = 4
}) => {
  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={`header-${index}`} variant="text" height="20px" width="80%" />
        ))}
      </div>
      
      {/* Table Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div 
            key={`row-${rowIndex}`}
            className="grid gap-4" 
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton 
                key={`cell-${rowIndex}-${colIndex}`} 
                variant="text" 
                height="16px" 
                width={colIndex === 0 ? '90%' : '70%'} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Metrics Card Loading
export const MetricsCardLoading: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton variant="text" width="40%" height="16px" />
            <Skeleton variant="circle" width="24px" height="24px" />
          </div>
          <Skeleton variant="text" width="30%" height="28px" />
          <div className="flex items-center space-x-2">
            <Skeleton variant="text" width="20%" height="14px" />
            <Skeleton variant="text" width="25%" height="14px" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// List Loading Skeleton
export const ListLoading: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
          <Skeleton variant="circle" width="40px" height="40px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" height="16px" />
            <Skeleton variant="text" width="40%" height="14px" />
          </div>
          <Skeleton variant="rounded" width="80px" height="32px" />
        </div>
      ))}
    </div>
  );
};

// Button Loading State
export const ButtonLoading: React.FC<{ 
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
}> = ({ 
  children, 
  isLoading = false, 
  loadingText,
  className 
}) => {
  if (isLoading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{loadingText || 'Loading...'}</span>
      </div>
    );
  }
  
  return <>{children}</>;
};