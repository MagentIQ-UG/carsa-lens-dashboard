/**
 * Data Table Component
 * Professional data table with enterprise features
 * Following accessibility and usability best practices
 */

import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { cn } from '@/lib/utils';

import { Badge } from './badge';
import { Button } from './button';
import { Input } from './input';
import { LoadingSpinner } from './loading-states';

interface Column<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  searchable?: boolean;
  onSearch?: (query: string) => void;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  rowKey?: string | ((record: T) => string);
  actions?: {
    onView?: (record: T) => void;
    onEdit?: (record: T) => void;
    onDelete?: (record: T) => void;
    custom?: Array<{
      key: string;
      label: string;
      icon?: React.ReactNode;
      onClick: (record: T) => void;
    }>;
  };
  className?: string;
  emptyText?: string;
  onExport?: () => void;
}

interface TableActionsProps<T> {
  record: T;
  actions: DataTableProps<T>['actions'];
}

type SortOrder = 'asc' | 'desc' | null;

// Table Actions Dropdown
const TableActions = <T,>({ record, actions }: TableActionsProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);

  const actionItems = [
    ...(actions?.onView ? [{ key: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: actions.onView }] : []),
    ...(actions?.onEdit ? [{ key: 'edit', label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: actions.onEdit }] : []),
    ...(actions?.onDelete ? [{ key: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: actions.onDelete }] : []),
    ...(actions?.custom || []),
  ];

  if (actionItems.length === 0) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {actionItems.map((action) => (
              <button
                key={action.key}
                onClick={() => {
                  action.onClick(record);
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {action.icon}
                <span className="ml-2">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Data Table Component
const DataTable = <T,>({
  columns,
  data,
  loading = false,
  pagination,
  searchable = false,
  onSearch,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  rowKey = 'id',
  actions,
  className,
  emptyText = 'No data available',
  onExport
}: DataTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortOrder;
  }>({ key: '', direction: null });

  // Get row key
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return (record as any)[rowKey] || index.toString();
  };

  // Handle sorting
  const handleSort = (columnKey: string) => {
    let direction: SortOrder = 'asc';
    
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === columnKey && sortConfig.direction === 'desc') {
      direction = null;
    }
    
    setSortConfig({ key: columnKey, direction });
  };

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig.direction || !sortConfig.key) {
      return data;
    }

    return [...data].sort((a, b) => {
      const column = columns.find(col => col.key === sortConfig.key);
      if (!column) return 0;

      const aValue = column.dataIndex ? (a as any)[column.dataIndex] : '';
      const bValue = column.dataIndex ? (b as any)[column.dataIndex] : '';

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig, columns]);

  // Handle search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  // Handle selection
  const handleRowSelection = (rowId: string, checked: boolean) => {
    if (!onSelectionChange) return;

    const newSelection = checked
      ? [...selectedRows, rowId]
      : selectedRows.filter(id => id !== rowId);
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    const newSelection = checked 
      ? sortedData.map((record, index) => getRowKey(record, index))
      : [];
    
    onSelectionChange(newSelection);
  };

  // Add actions column if actions are provided
  const displayColumns = useMemo(() => {
    const cols = [...columns];
    
    if (actions && (actions.onView || actions.onEdit || actions.onDelete || actions.custom)) {
      cols.push({
        key: 'actions',
        title: 'Actions',
        align: 'center' as const,
        width: '80px',
        render: (_, record) => <TableActions record={record} actions={actions} />
      });
    }
    
    return cols;
  }, [columns, actions]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          )}
          
          {selectable && selectedRows.length > 0 && (
            <Badge variant="primary">
              {selectedRows.length} selected
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table Head */}
            <thead className="bg-gray-50">
              <tr>
                {selectable && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === sortedData.length && sortedData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                
                {displayColumns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                      {
                        'text-left': column.align === 'left' || !column.align,
                        'text-center': column.align === 'center',
                        'text-right': column.align === 'right',
                        'cursor-pointer hover:bg-gray-100': column.sortable,
                      }
                    )}
                    style={{ width: column.width }}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.title}</span>
                      {column.sortable && (
                        <span className="flex flex-col">
                          {sortConfig.key === column.key ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : sortConfig.direction === 'desc' ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronsUpDown className="h-3 w-3" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 text-gray-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td 
                    colSpan={displayColumns.length + (selectable ? 1 : 0)} 
                    className="px-6 py-12 text-center"
                  >
                    <LoadingSpinner text="Loading data..." />
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={displayColumns.length + (selectable ? 1 : 0)} 
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {emptyText}
                  </td>
                </tr>
              ) : (
                sortedData.map((record, index) => {
                  const rowId = getRowKey(record, index);
                  const isSelected = selectedRows.includes(rowId);

                  return (
                    <tr 
                      key={rowId}
                      className={cn(
                        'hover:bg-gray-50 transition-colors',
                        isSelected && 'bg-blue-50'
                      )}
                    >
                      {selectable && (
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleRowSelection(rowId, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                      )}
                      
                      {displayColumns.map((column) => {
                        const value = column.dataIndex ? (record as any)[column.dataIndex] : record;
                        const content = column.render 
                          ? column.render(value, record, index)
                          : value;

                        return (
                          <td
                            key={column.key}
                            className={cn(
                              'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                              {
                                'text-left': column.align === 'left' || !column.align,
                                'text-center': column.align === 'center',
                                'text-right': column.align === 'right',
                              }
                            )}
                          >
                            {content}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">
              {(pagination.current - 1) * pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(pagination.current * pagination.pageSize, pagination.total)}
            </span>{' '}
            of{' '}
            <span className="font-medium">{pagination.total}</span>{' '}
            results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              disabled={pagination.current <= 1}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-700">
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export { DataTable };
export type { Column, DataTableProps };