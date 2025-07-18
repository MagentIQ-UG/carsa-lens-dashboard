/**
 * Dashboard Layout Component
 * Professional enterprise dashboard layout with sidebar, navigation, and content area
 * Responsive design with mobile support
 */

import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  ClipboardList, 
  BarChart3, 
  Settings,
  Building2,
  UserPlus,
  Trophy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/breadcrumbs';
import { TopNavigation } from '@/components/ui/navigation';
import { Sidebar, SidebarItem } from '@/components/ui/sidebar';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';
import type { User } from '@/types/api';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
  sidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title = 'Dashboard',
  breadcrumbs = [],
  className,
  sidebarCollapsed = false,
  onSidebarCollapsedChange
}) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(sidebarCollapsed);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    onSidebarCollapsedChange?.(collapsed);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Sidebar navigation items
  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      id: 'jobs',
      label: 'Jobs',
      href: '/dashboard/jobs',
      icon: <Briefcase className="h-5 w-5" />,
      badge: '12'
    },
    {
      id: 'candidates',
      label: 'Candidates',
      href: '/dashboard/candidates',
      icon: <Users className="h-5 w-5" />,
      badge: '48'
    },
    {
      id: 'evaluations',
      label: 'Evaluations',
      href: '/dashboard/evaluations',
      icon: <ClipboardList className="h-5 w-5" />,
      badge: '6'
    },
    {
      id: 'rankings',
      label: 'Rankings',
      href: '/dashboard/rankings',
      icon: <Trophy className="h-5 w-5" />,
      badge: '3'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/dashboard/analytics',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      id: 'organization',
      label: 'Organization',
      icon: <Building2 className="h-5 w-5" />,
      children: [
        {
          id: 'org-settings',
          label: 'Settings',
          href: '/dashboard/organization/settings',
          icon: <Settings className="h-4 w-4" />
        },
        {
          id: 'org-members',
          label: 'Members',
          href: '/dashboard/organization/members',
          icon: <Users className="h-4 w-4" />
        },
        {
          id: 'org-invitations',
          label: 'Invitations',
          href: '/dashboard/organization/invitations',
          icon: <UserPlus className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="h-5 w-5" />
    }
  ];

  // Handle logout - the logout hook handles all async operations and error cases
  const handleLogout = () => {
    logout();
    // The logout hook automatically:
    // - Calls the logout API
    // - Clears local auth state
    // - Removes auth cookies
    // - Clears React Query cache
    // - Redirects to login page
    // - Handles errors gracefully
  };

  // Handle navigation actions
  const handleSettings = () => {
    router.push('/dashboard/settings');
  };

  const handleProfile = () => {
    router.push('/dashboard/profile');
  };

  // Helper function to safely get user full name
  const getUserFullName = (user: User | null): string => {
    if (!user) return 'Loading...';
    
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else if (user.email) {
      return user.email.split('@')[0]; // Use email username as fallback
    }
    
    return 'User';
  };

  // Use real user data from auth context with safe access
  const userMenuProps = {
    user: {
      name: getUserFullName(user),
      email: user?.email || 'Loading...',
      avatar: undefined // TODO: Add avatar support when backend provides it
    },
    onLogout: handleLogout,
    onSettings: handleSettings,
    onProfile: handleProfile
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 flex', className)}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col">
        <Sidebar
          items={sidebarItems}
          collapsed={isSidebarCollapsed}
          onCollapsedChange={handleSidebarCollapse}
          header={
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CL</span>
              </div>
              {!isSidebarCollapsed && (
                <span className="text-lg font-semibold text-gray-900">CARSA Lens</span>
              )}
            </div>
          }
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-64 h-full bg-white">
            <Sidebar
              items={sidebarItems}
              collapsed={false}
              showCollapseButton={false}
              header={
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">CL</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">CARSA Lens</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              }
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <TopNavigation
          title={title}
          userMenu={userMenuProps}
          onMenuClick={handleMobileMenuToggle}
        />

        {/* Page Header with Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export { DashboardLayout };
export type { DashboardLayoutProps };