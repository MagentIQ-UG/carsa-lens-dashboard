/**
 * Sidebar Component
 * Professional sidebar navigation with collapsible design
 * Following enterprise dashboard patterns
 */

import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';

import { Button } from './button';

interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: SidebarItem[];
  onClick?: () => void;
  disabled?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  showCollapseButton?: boolean;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

interface SidebarItemProps {
  item: SidebarItem;
  collapsed: boolean;
  level?: number;
}

const SidebarItemComponent: React.FC<SidebarItemProps> = ({ 
  item, 
  collapsed, 
  level = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? pathname === item.href : false;
  const isParentActive = hasChildren && item.children?.some(child => 
    child.href && pathname.startsWith(child.href)
  );

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
    if (item.onClick) {
      item.onClick();
    }
  };

  const itemContent = (
    <div 
      className={cn(
        'flex items-center justify-between w-full px-3 py-2 text-left rounded-md transition-all duration-200',
        'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
        {
          'bg-blue-50 text-blue-700 border-r-2 border-blue-500': isActive,
          'bg-gray-50 text-gray-900': isParentActive && !isActive,
          'text-gray-600': !isActive && !isParentActive,
          'opacity-50 cursor-not-allowed': item.disabled,
          'pl-6': level > 0,
        }
      )}
      style={{ paddingLeft: `${0.75 + level * 1}rem` }}
    >
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        {item.icon && (
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {item.icon}
          </span>
        )}
        {!collapsed && (
          <span className="truncate text-sm font-medium">
            {item.label}
          </span>
        )}
      </div>
      
      {!collapsed && (
        <div className="flex items-center space-x-2 flex-shrink-0">
          {item.badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronDown 
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isExpanded && 'transform rotate-180'
              )}
            />
          )}
        </div>
      )}
    </div>
  );

  return (
    <div>
      {item.href && !hasChildren ? (
        <Link href={item.href} className="block">
          {itemContent}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          disabled={item.disabled}
          className="w-full"
        >
          {itemContent}
        </button>
      )}
      
      {hasChildren && isExpanded && !collapsed && (
        <div className="mt-1 space-y-1">
          {item.children?.map((child) => (
            <SidebarItemComponent
              key={child.id}
              item={child}
              collapsed={collapsed}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  items,
  collapsed = false,
  onCollapsedChange,
  showCollapseButton = true,
  className,
  header,
  footer
}) => {
  const handleCollapsedChange = () => {
    if (onCollapsedChange) {
      onCollapsedChange(!collapsed);
    }
  };

  return (
    <div 
      className={cn(
        'flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      {header && (
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          {header}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {items.map((item) => (
          <SidebarItemComponent
            key={item.id}
            item={item}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          {footer}
        </div>
      )}

      {/* Collapse Button */}
      {showCollapseButton && (
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCollapsedChange}
            className="w-full justify-center"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Collapse
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export { Sidebar };
export type { SidebarItem, SidebarProps };