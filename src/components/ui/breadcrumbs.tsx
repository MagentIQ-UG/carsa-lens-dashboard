/**
 * Breadcrumbs Component
 * Professional navigation breadcrumbs with enterprise design
 * Following accessibility and usability best practices
 */

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  separator?: React.ReactNode;
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  separator = <ChevronRight className="h-4 w-4 text-gray-400" />,
  className
}) => {
  const allItems = showHome 
    ? [{ label: 'Home', href: '/dashboard', icon: <Home className="h-4 w-4" /> }, ...items]
    : items;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn('flex items-center space-x-2 text-sm', className)}
    >
      <ol className="flex items-center space-x-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isCurrent = ('current' in item && item.current) || isLast;

          return (
            <li key={index} className="flex items-center space-x-2">
              {index > 0 && (
                <span className="flex items-center" aria-hidden="true">
                  {separator}
                </span>
              )}
              
              {isCurrent ? (
                <span 
                  className="flex items-center space-x-1 font-medium text-gray-900"
                  aria-current="page"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href || '#'}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export { Breadcrumbs };
export type { BreadcrumbItem };