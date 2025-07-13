/**
 * Modern Card Component
 * Enhanced container component with glassmorphism, elevation, and modern styling
 * Inspired by top-tier product interfaces (OpenAI, Salesforce, Google)
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-lg transition-all duration-200 ease-out',
  {
    variants: {
      variant: {
        // Default - Clean modern card
        default: 'bg-card text-card-foreground border border-border shadow-elevation-2',
        
        // Elevated - Enhanced shadow
        elevated: 'bg-card text-card-foreground border border-border shadow-elevation-4',
        
        // Glass - Glassmorphism effect
        glass: 'bg-white/10 backdrop-blur-glass border border-white/20 text-card-foreground shadow-elevation-3',
        
        // Outlined - Modern outline style
        outlined: 'bg-card text-card-foreground border-2 border-border hover:border-primary/30',
        
        // Ghost - Minimal styling
        ghost: 'bg-transparent text-card-foreground',
        
        // Interactive - Hover effects
        interactive: 'bg-card text-card-foreground border border-border shadow-elevation-2 hover:shadow-elevation-3 hover:-translate-y-0.5 cursor-pointer',
        
        // Gradient - Subtle gradient background
        gradient: 'bg-gradient-to-br from-background to-muted text-card-foreground border border-border shadow-elevation-2',
        
        // Feature - Eye-catching for important content
        feature: 'bg-primary/5 text-card-foreground border border-primary/20 shadow-elevation-2 relative overflow-hidden',
        
        // Alert - For notifications and alerts
        alert: 'bg-card text-card-foreground border-l-4 border-l-primary shadow-elevation-2',
      },
      padding: {
        none: 'p-0',
        xs: 'p-2',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
        '2xl': 'p-10',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'lg',
      rounded: 'lg',
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  hover?: boolean;
  animate?: boolean;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  separator?: boolean;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  separator?: boolean;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant,
    padding,
    rounded,
    children,
    hover = false,
    animate = false,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, padding, rounded }),
          {
            'hover:shadow-elevation-3 hover:border-primary/20': hover && variant !== 'interactive',
            'animate-fade-in-up': animate,
          },
          className
        )}
        {...props}
      >
        {variant === 'feature' && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        )}
        <div className="relative">{children}</div>
      </div>
    );
  }
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, separator = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col space-y-1.5',
          separator && 'pb-4 border-b border-border/50 last:border-b-0',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('py-4 first:pt-0 last:pb-0', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, separator = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          separator && 'pt-4 border-t border-border/50 first:border-t-0',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, as: Component = 'h3', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'text-lg font-semibold leading-none tracking-tight text-card-foreground',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          'text-sm text-muted-foreground leading-relaxed',
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';

export { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardTitle, 
  CardDescription,
  cardVariants 
};
export type { CardProps };