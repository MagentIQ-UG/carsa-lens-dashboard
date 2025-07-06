/**
 * Skeleton Component
 * Professional loading skeleton with modern shimmer effect
 * Following Material Design and enterprise UI patterns
 */

import React from 'react';

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangle' | 'circle' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'rectangle',
    width,
    height,
    lines = 1,
    animated = true,
    style,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'bg-gray-200',
      animated && 'animate-pulse',
      {
        'rounded-none': variant === 'rectangle',
        'rounded-md': variant === 'rounded',
        'rounded-full': variant === 'circle',
        'rounded-sm h-4': variant === 'text',
      },
      className
    );

    const inlineStyles = {
      width: width,
      height: height,
      ...style,
    };

    // For text variant with multiple lines
    if (variant === 'text' && lines > 1) {
      return (
        <div className="space-y-2">
          {Array.from({ length: lines }, (_, index) => (
            <div
              key={index}
              className={cn(
                baseClasses,
                index === lines - 1 && 'w-3/4' // Last line is shorter
              )}
              style={index === lines - 1 ? { ...inlineStyles, width: '75%' } : inlineStyles}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={baseClasses}
        style={inlineStyles}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Predefined skeleton components for common use cases
const SkeletonText = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  (props, ref) => <Skeleton ref={ref} variant="text" {...props} />
);

const SkeletonCircle = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  (props, ref) => <Skeleton ref={ref} variant="circle" {...props} />
);

const SkeletonRectangle = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  (props, ref) => <Skeleton ref={ref} variant="rectangle" {...props} />
);

SkeletonText.displayName = 'SkeletonText';
SkeletonCircle.displayName = 'SkeletonCircle';
SkeletonRectangle.displayName = 'SkeletonRectangle';

export { Skeleton, SkeletonText, SkeletonCircle, SkeletonRectangle };