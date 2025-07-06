/**
 * Container Component
 * Responsive container with professional layout constraints
 * Following enterprise design system standards
 */

import React from 'react';

import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
  children: React.ReactNode;
}

const sizeVariants = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-8xl',
  full: 'max-w-full',
};

const paddingVariants = {
  none: 'px-0',
  sm: 'px-3 sm:px-4',
  md: 'px-4 sm:px-6',
  lg: 'px-4 sm:px-6 lg:px-8',
  xl: 'px-6 sm:px-8 lg:px-12',
};

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    className, 
    size = 'xl', 
    padding = 'lg',
    center = true,
    children, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          sizeVariants[size],
          paddingVariants[padding],
          center && 'mx-auto',
          'w-full',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export { Container };