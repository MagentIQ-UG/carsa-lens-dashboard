/**
 * Navigation Components
 * Professional navigation bar and menu components
 * Following enterprise design patterns
 */

import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut,
  Menu,
  ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';

import { Button } from './button';
import { Input } from './input';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  active?: boolean;
}

interface UserMenuProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
  onSettings?: () => void;
  onProfile?: () => void;
}

interface TopNavigationProps {
  title?: string;
  items?: NavigationItem[];
  showSearch?: boolean;
  showNotifications?: boolean;
  userMenu?: UserMenuProps;
  onMenuClick?: () => void;
  className?: string;
}

interface TabNavigationProps {
  items: NavigationItem[];
  className?: string;
}

// User Menu Dropdown
const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onLogout,
  onSettings,
  onProfile
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { label: 'Profile', onClick: onProfile, icon: <User className="h-4 w-4" /> },
    { label: 'Settings', onClick: onSettings, icon: <Settings className="h-4 w-4" /> },
    { label: 'Sign Out', onClick: onLogout, icon: <LogOut className="h-4 w-4" /> },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          {user?.avatar ? (
            <Image 
              src={user.avatar} 
              alt={user.name} 
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          )}
        </div>
        {user && (
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        )}
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Top Navigation Bar
const TopNavigation: React.FC<TopNavigationProps> = ({
  title,
  items = [],
  showSearch = true,
  showNotifications = true,
  userMenu,
  onMenuClick,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount] = useState(3); // Mock notification count

  return (
    <header className={cn('bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8', className)}>
      <div className="flex items-center justify-between h-16">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {title && (
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          )}
          
          {/* Navigation Items */}
          {items.length > 0 && (
            <nav className="hidden md:flex space-x-8">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    item.active 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          {showSearch && (
            <div className="hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          )}

          {/* Notifications */}
          {showNotifications && (
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>
          )}

          {/* User Menu */}
          {userMenu && <UserMenu {...userMenu} />}
        </div>
      </div>
    </header>
  );
};

// Tab Navigation
const TabNavigation: React.FC<TabNavigationProps> = ({ items, className }) => {
  const pathname = usePathname();

  return (
    <nav className={cn('border-b border-gray-200', className)}>
      <div className="flex space-x-8 px-4 sm:px-6 lg:px-8">
        {items.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center space-x-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export { TopNavigation, TabNavigation, UserMenu };
export type { NavigationItem, UserMenuProps, TopNavigationProps, TabNavigationProps };