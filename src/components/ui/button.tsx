/**
 * Modern Button Component
 * Enhanced button with modern styling, multiple variants, and improved accessibility
 * Inspired by top-tier product interfaces (OpenAI, Salesforce, Google)
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
  {
    variants: {
      variant: {
        // Primary - Modern gradient with elevation
        primary: 'bg-primary text-primary-foreground shadow-elevation-2 hover:shadow-elevation-3 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0',
        
        // Secondary - AI purple accent
        secondary: 'bg-secondary text-secondary-foreground shadow-elevation-2 hover:shadow-elevation-3 hover:bg-secondary/90 hover:-translate-y-0.5 active:translate-y-0',
        
        // Outline - Modern border with hover effects
        outline: 'border border-input bg-background shadow-elevation-1 hover:bg-accent hover:text-accent-foreground hover:shadow-elevation-2 hover:border-primary/50',
        
        // Ghost - Subtle with modern hover
        ghost: 'hover:bg-accent hover:text-accent-foreground hover:shadow-elevation-1',
        
        // Glass - Glassmorphism effect
        glass: 'bg-white/10 backdrop-blur-glass border border-white/20 text-foreground hover:bg-white/20 hover:border-white/30 shadow-elevation-2',
        
        // Destructive - Modern error styling
        destructive: 'bg-destructive text-destructive-foreground shadow-elevation-2 hover:shadow-elevation-3 hover:bg-destructive/90 hover:-translate-y-0.5',
        
        // Link - Clean text button
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80',
        
        // Floating Action Button
        fab: 'rounded-full shadow-elevation-4 bg-primary text-primary-foreground hover:shadow-elevation-5 hover:-translate-y-1 hover:scale-105 active:scale-95',
        
        // Gradient - Eye-catching gradient
        gradient: 'bg-gradient-to-r from-primary to-secondary text-white shadow-elevation-3 hover:shadow-elevation-4 hover:-translate-y-0.5 hover:from-primary/90 hover:to-secondary/90',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4 py-2',
        lg: 'h-10 px-8 text-base',
        xl: 'h-12 px-10 text-lg',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-10 w-10',
        'icon-xl': 'h-12 w-12',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      rounded: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
  asChild?: boolean;
  pulse?: boolean;
  glow?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    rounded,
    loading = false,
    leftIcon,
    rightIcon,
    loadingText,
    children,
    disabled,
    pulse = false,
    glow = false,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    
    // Enhanced loading spinner with modern styling
    const LoadingSpinner = () => (
      <svg
        className="h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, rounded }),
          {
            'cursor-not-allowed': isDisabled,
            'animate-pulse': pulse && !loading,
            'hover:shadow-glow': glow && variant === 'primary',
            'before:absolute before:inset-0 before:bg-white before:opacity-20 before:transition-opacity before:duration-300 hover:before:opacity-30': 
              variant === 'gradient',
          },
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* Ripple effect container */}
        <span className="absolute inset-0 overflow-hidden rounded-inherit">
          <span className="absolute inset-0 transition-opacity duration-150 ease-out opacity-0 hover:opacity-20 bg-white" />
        </span>
        
        {/* Content */}
        <span className="relative flex items-center gap-2">
          {loading ? (
            <>
              <LoadingSpinner />
              {loadingText || children}
            </>
          ) : (
            <>
              {leftIcon && (
                <span className="inline-flex shrink-0 items-center">
                  {leftIcon}
                </span>
              )}
              {children}
              {rightIcon && (
                <span className="inline-flex shrink-0 items-center">
                  {rightIcon}
                </span>
              )}
            </>
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
export type { ButtonProps };