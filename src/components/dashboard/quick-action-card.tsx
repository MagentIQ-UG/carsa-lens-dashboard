/**
 * QuickActionCard Component
 * Interactive action cards for dashboard shortcuts with enterprise design
 */

'use client';

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  badge?: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50 hover:bg-blue-100',
    icon: 'text-blue-600',
    border: 'border-blue-200 hover:border-blue-300',
    text: 'text-blue-900'
  },
  green: {
    bg: 'bg-green-50 hover:bg-green-100',
    icon: 'text-green-600',
    border: 'border-green-200 hover:border-green-300',
    text: 'text-green-900'
  },
  purple: {
    bg: 'bg-purple-50 hover:bg-purple-100',
    icon: 'text-purple-600',
    border: 'border-purple-200 hover:border-purple-300',
    text: 'text-purple-900'
  },
  orange: {
    bg: 'bg-orange-50 hover:bg-orange-100',
    icon: 'text-orange-600',
    border: 'border-orange-200 hover:border-orange-300',
    text: 'text-orange-900'
  },
  red: {
    bg: 'bg-red-50 hover:bg-red-100',
    icon: 'text-red-600',
    border: 'border-red-200 hover:border-red-300',
    text: 'text-red-900'
  },
  gray: {
    bg: 'bg-gray-50 hover:bg-gray-100',
    icon: 'text-gray-600',
    border: 'border-gray-200 hover:border-gray-300',
    text: 'text-gray-900'
  }
};

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  color = 'blue',
  badge,
  disabled = false,
  onClick,
  className
}: QuickActionCardProps) {
  const colors = colorVariants[color];
  
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const cardContent = (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200 cursor-pointer group',
        colors.bg,
        colors.border,
        'hover:shadow-md hover:scale-[1.02]',
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none',
        className
      )}
    >
      <div className="p-6">
        {/* Badge */}
        {badge && (
          <div className="absolute top-4 right-4">
            <span className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              color === 'blue' && 'bg-blue-100 text-blue-800',
              color === 'green' && 'bg-green-100 text-green-800',
              color === 'purple' && 'bg-purple-100 text-purple-800',
              color === 'orange' && 'bg-orange-100 text-orange-800',
              color === 'red' && 'bg-red-100 text-red-800',
              color === 'gray' && 'bg-gray-100 text-gray-800'
            )}>
              {badge}
            </span>
          </div>
        )}

        {/* Icon */}
        <div className={cn(
          'inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4',
          color === 'blue' && 'bg-blue-100',
          color === 'green' && 'bg-green-100',
          color === 'purple' && 'bg-purple-100',
          color === 'orange' && 'bg-orange-100',
          color === 'red' && 'bg-red-100',
          color === 'gray' && 'bg-gray-100'
        )}>
          <Icon className={cn('h-6 w-6', colors.icon)} />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className={cn(
            'text-lg font-semibold group-hover:text-opacity-80 transition-colors',
            colors.text
          )}>
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Hover arrow */}
        <div className={cn(
          'absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity',
          'transform translate-x-2 group-hover:translate-x-0 transition-transform',
          colors.icon
        )}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Card>
  );

  if (disabled) {
    return (
      <div onClick={handleClick}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={href} onClick={handleClick}>
      {cardContent}
    </Link>
  );
}

export default QuickActionCard;