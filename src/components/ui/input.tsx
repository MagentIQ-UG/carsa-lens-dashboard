/**
 * Modern Input Component
 * Enhanced input field with modern styling, validation states, and accessibility
 * Inspired by top-tier product interfaces (OpenAI, Salesforce, Google)
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground',
  {
    variants: {
      variant: {
        // Default - Modern clean input
        default: 'border border-input bg-background shadow-elevation-1 focus-visible:shadow-elevation-2 focus-visible:border-primary',
        
        // Filled - Material Design inspired
        filled: 'border-0 bg-muted shadow-none focus-visible:bg-background focus-visible:shadow-elevation-2 focus-visible:ring-1',
        
        // Outline - Enhanced outline
        outline: 'border-2 border-border bg-background focus-visible:border-primary focus-visible:shadow-elevation-1',
        
        // Glass - Glassmorphism effect
        glass: 'border border-white/20 bg-white/10 backdrop-blur-glass shadow-elevation-2 focus-visible:bg-white/20 focus-visible:border-white/40',
        
        // Minimal - Clean, borderless
        minimal: 'border-0 border-b-2 border-border rounded-none bg-transparent shadow-none focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0',
        
        // Search - Optimized for search
        search: 'border border-input bg-muted/50 shadow-none focus-visible:bg-background focus-visible:shadow-elevation-1 focus-visible:border-primary',
      },
      size: {
        xs: 'h-7 px-2 text-xs rounded-sm',
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-9 px-3 py-2 text-sm rounded-md',
        lg: 'h-10 px-4 py-2 text-base rounded-md',
        xl: 'h-12 px-4 py-3 text-lg rounded-lg',
      },
      state: {
        default: '',
        error: 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive',
        success: 'border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500',
        warning: 'border-yellow-500 focus-visible:border-yellow-500 focus-visible:ring-yellow-500',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
);

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  loading?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    variant,
    size,
    state,
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    rightAction,
    leftAddon,
    rightAddon,
    loading = false,
    clearable = false,
    onClear,
    id,
    required,
    value,
    disabled,
    ...props
  }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperTextId = `${inputId}-helper`;

    const currentState = error ? 'error' : state;
    const showClearButton = clearable && value && !disabled && !loading;

    const LoadingSpinner = () => (
      <svg
        className="h-4 w-4 animate-spin text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
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

    const ClearButton = () => (
      <button
        type="button"
        onClick={onClear}
        className="flex h-full w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
        aria-label="Clear input"
      >
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    );

    return (
      <div className="w-full space-y-2">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required && (
              <span className="ml-1 text-destructive" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className="relative flex">
          {/* Left Addon */}
          {leftAddon && (
            <div className="flex items-center px-3 border border-r-0 border-input bg-muted text-muted-foreground rounded-l-md text-sm">
              {leftAddon}
            </div>
          )}

          {/* Input Wrapper */}
          <div className="relative flex-1">
            {/* Left Icon */}
            {leftIcon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
                {leftIcon}
              </div>
            )}

            <input
              type={type}
              className={cn(
                inputVariants({ variant, size, state: currentState }),
                {
                  'pl-10': leftIcon,
                  'pr-10': rightIcon || rightAction || loading || showClearButton,
                  'pr-16': (rightIcon || rightAction || loading) && showClearButton,
                  'rounded-l-none border-l-0': leftAddon,
                  'rounded-r-none border-r-0': rightAddon,
                },
                className
              )}
              ref={ref}
              id={inputId}
              value={value}
              disabled={disabled || loading}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={cn(
                error && errorId,
                helperText && helperTextId
              )}
              {...props}
            />

            {/* Right Side Icons/Actions */}
            <div className="absolute inset-y-0 right-0 flex items-center">
              {loading && (
                <div className="flex items-center justify-center w-8 h-full">
                  <LoadingSpinner />
                </div>
              )}

              {rightAction && !loading && (
                <div className="flex items-center justify-center w-8 h-full">
                  {rightAction}
                </div>
              )}

              {rightIcon && !rightAction && !loading && (
                <div className="flex items-center justify-center w-8 h-full text-muted-foreground pointer-events-none">
                  {rightIcon}
                </div>
              )}

              {showClearButton && <ClearButton />}
            </div>
          </div>

          {/* Right Addon */}
          {rightAddon && (
            <div className="flex items-center px-3 border border-l-0 border-input bg-muted text-muted-foreground rounded-r-md text-sm">
              {rightAddon}
            </div>
          )}
        </div>

        {/* Error/Helper Text */}
        <div className="space-y-1">
          {error && (
            <p
              id={errorId}
              className="text-xs text-destructive flex items-center gap-1"
              role="alert"
            >
              <svg
                className="h-3 w-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          )}

          {helperText && !error && (
            <p id={helperTextId} className="text-xs text-muted-foreground">
              {helperText}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
export type { InputProps };