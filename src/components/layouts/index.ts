/**
 * Layout Components Index
 * Centralized exports for all layout components
 */

export { DashboardLayout } from './dashboard-layout';
export type { DashboardLayoutProps } from './dashboard-layout';

export { PageHeader, HeaderActions } from './page-header';
export type { PageHeaderProps, HeaderActionsProps } from './page-header';

// Re-export UI components for convenience
export { Breadcrumbs } from '@/components/ui/breadcrumbs';
export type { BreadcrumbItem } from '@/components/ui/breadcrumbs';

export { TopNavigation, TabNavigation, UserMenu } from '@/components/ui/navigation';
export type { NavigationItem, UserMenuProps, TopNavigationProps, TabNavigationProps } from '@/components/ui/navigation';

export { Sidebar } from '@/components/ui/sidebar';
export type { SidebarItem, SidebarProps } from '@/components/ui/sidebar';