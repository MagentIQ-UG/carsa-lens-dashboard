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
  UserPlus
} from 'lucide-react';
import React, { useState } from 'react';

import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/breadcrumbs';
import { TopNavigation } from '@/components/ui/navigation';
import { Sidebar, SidebarItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

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

  // Mock user data
  const mockUser = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    avatar: undefined
  };

  const userMenuProps = {
    user: mockUser,
    onLogout: () => {/* TODO: Implement logout */},
    onSettings: () => {/* TODO: Implement settings */},
    onProfile: () => {/* TODO: Implement profile */}
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