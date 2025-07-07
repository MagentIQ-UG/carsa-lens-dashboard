/**
 * NavigationGrid Component
 * Quick navigation grid for dashboard with feature shortcuts
 */

'use client';

import {
  Briefcase,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  FileText,
  UserPlus,
  Search,
  Calendar,
  Star,
  Download,
  Upload,
  LucideIcon
} from 'lucide-react';
import React from 'react';

import { QuickActionCard } from '@/components/dashboard/quick-action-card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/context';

interface NavigationItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  badge?: string;
  disabled?: boolean;
  requiredRole?: string[];
}

interface NavigationGridProps {
  title?: string;
  showHeader?: boolean;
  columns?: number;
  className?: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'create-job',
    title: 'Create Job',
    description: 'Post a new job opening and start attracting candidates',
    icon: Briefcase,
    href: '/dashboard/jobs/create',
    color: 'blue',
    badge: 'New'
  },
  {
    id: 'add-candidates',
    title: 'Add Candidates',
    description: 'Upload CVs or manually add candidate profiles',
    icon: UserPlus,
    href: '/dashboard/candidates/upload',
    color: 'green'
  },
  {
    id: 'run-evaluation',
    title: 'Run Evaluation',
    description: 'Start AI-powered candidate evaluations',
    icon: ClipboardList,
    href: '/dashboard/evaluations/create',
    color: 'purple',
    badge: 'AI'
  },
  {
    id: 'view-jobs',
    title: 'View Jobs',
    description: 'Browse and manage all job postings',
    icon: Search,
    href: '/dashboard/jobs',
    color: 'blue'
  },
  {
    id: 'candidate-pipeline',
    title: 'Candidate Pipeline',
    description: 'Track candidates through hiring stages',
    icon: Users,
    href: '/dashboard/candidates',
    color: 'green'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'View hiring metrics and performance insights',
    icon: BarChart3,
    href: '/dashboard/analytics',
    color: 'orange'
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'Generate and export recruitment reports',
    icon: FileText,
    href: '/dashboard/reports',
    color: 'gray'
  },
  {
    id: 'calendar',
    title: 'Interview Calendar',
    description: 'Schedule and manage interviews',
    icon: Calendar,
    href: '/dashboard/calendar',
    color: 'purple',
    disabled: true,
    badge: 'Coming Soon'
  },
  {
    id: 'favorites',
    title: 'Saved Searches',
    description: 'Access your saved candidate searches',
    icon: Star,
    href: '/dashboard/favorites',
    color: 'orange',
    disabled: true,
    badge: 'Coming Soon'
  },
  {
    id: 'bulk-upload',
    title: 'Bulk Upload',
    description: 'Upload multiple CVs at once',
    icon: Upload,
    href: '/dashboard/candidates/bulk-upload',
    color: 'green',
    requiredRole: ['admin', 'manager']
  },
  {
    id: 'export-data',
    title: 'Export Data',
    description: 'Export recruitment data and analytics',
    icon: Download,
    href: '/dashboard/export',
    color: 'gray',
    requiredRole: ['admin', 'manager']
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Configure system preferences',
    icon: Settings,
    href: '/dashboard/settings',
    color: 'gray',
    requiredRole: ['admin']
  }
];

export function NavigationGrid({
  title = 'Quick Actions',
  showHeader = true,
  columns = 3,
  className
}: NavigationGridProps) {
  const { hasRole } = useAuth();

  // Filter items based on user role
  const filteredItems = navigationItems.filter(item => {
    if (!item.requiredRole) return true;
    return item.requiredRole.some(role => hasRole(role));
  });

  const handleItemClick = (item: NavigationItem) => {
    if (item.disabled) {
      console.warn(`${item.title} is not yet available`);
      return;
    }
    
    // Navigation will be handled by the QuickActionCard component
    console.warn(`Navigating to ${item.href}`);
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <div className="text-sm text-gray-500">
              {filteredItems.length} available
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={showHeader ? '' : 'pt-6'}>
        <div className={`grid gap-4 ${gridCols[columns as keyof typeof gridCols]}`}>
          {filteredItems.map((item) => (
            <QuickActionCard
              key={item.id}
              title={item.title}
              description={item.description}
              icon={item.icon}
              href={item.href}
              color={item.color}
              badge={item.badge}
              disabled={item.disabled}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No actions available for your role
            </p>
          </div>
        )}
        
        {filteredItems.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                Showing {filteredItems.length} of {navigationItems.length} actions
              </span>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                View all features →
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default NavigationGrid;