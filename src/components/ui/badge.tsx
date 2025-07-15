/**
 * Badge Component
 * Professional badges and status indicators
 * Following enterprise design patterns
 */

import React from 'react';

import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  outlined?: boolean;
  children: React.ReactNode;
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-purple-100 text-purple-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-cyan-100 text-cyan-800',
  outline: 'border border-gray-300 text-gray-700 bg-white',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
};

const badgeOutlinedVariants = {
  default: 'border border-gray-300 text-gray-700 bg-white',
  primary: 'border border-blue-300 text-blue-700 bg-white',
  secondary: 'border border-purple-300 text-purple-700 bg-white',
  success: 'border border-green-300 text-green-700 bg-white',
  warning: 'border border-yellow-300 text-yellow-700 bg-white',
  error: 'border border-red-300 text-red-700 bg-white',
  info: 'border border-cyan-300 text-cyan-700 bg-white',
  outline: 'border border-gray-300 text-gray-700 bg-white',
  ghost: 'border border-transparent text-gray-600 bg-transparent',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-sm',
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md',
    rounded = true,
    outlined = false,
    children, 
    ...props 
  }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium',
          outlined ? badgeOutlinedVariants[variant] : badgeVariants[variant],
          badgeSizes[size],
          rounded ? 'rounded-full' : 'rounded-md',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };