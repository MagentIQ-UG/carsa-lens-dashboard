/**
 * Metrics Card Components
 * Professional metrics display cards for dashboards
 * Following enterprise analytics design patterns
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

import { Card, CardContent } from './card';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
    direction: 'up' | 'down' | 'neutral';
  };
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

interface CompactMetricsProps {
  metrics: Array<{
    label: string;
    value: string | number;
    change?: number;
    unit?: string;
  }>;
  title?: string;
  className?: string;
}

interface KPICardProps {
  title: string;
  value: string | number;
  target?: string | number;
  progress?: number; // 0-100
  status?: 'success' | 'warning' | 'error' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

// Individual Metrics Card
const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  loading = false,
  className,
  onClick
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <Card className={cn('p-6', className)}>
        <CardContent className="p-0">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        'p-6 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600 truncate">
              {title}
            </h3>
            {icon && (
              <div className="flex-shrink-0 text-gray-400">
                {icon}
              </div>
            )}
          </div>

          {/* Value */}
          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {subtitle && (
              <div className="text-sm text-gray-500">
                {subtitle}
              </div>
            )}
          </div>

          {/* Trend */}
          {trend && (
            <div className="flex items-center space-x-2">
              {getTrendIcon()}
              <span className={cn('text-sm font-medium', getTrendColor())}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-sm text-gray-500">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Compact Metrics Display
const CompactMetrics: React.FC<CompactMetricsProps> = ({
  metrics,
  title,
  className
}) => {
  return (
    <Card className={cn('p-6', className)}>
      <CardContent className="p-0">
        <div className="space-y-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="space-y-1">
                <div className="text-sm text-gray-600">
                  {metric.label}
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {typeof metric.value === 'number' 
                      ? metric.value.toLocaleString() 
                      : metric.value}
                  </span>
                  {metric.unit && (
                    <span className="text-sm text-gray-500">
                      {metric.unit}
                    </span>
                  )}
                  {metric.change !== undefined && (
                    <span 
                      className={cn(
                        'text-xs font-medium',
                        metric.change > 0 
                          ? 'text-green-600' 
                          : metric.change < 0 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                      )}
                    >
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// KPI Card with Progress
const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  target,
  progress,
  status = 'neutral',
  icon,
  className
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'neutral':
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'neutral':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <Card className={cn('p-6', className)}>
      <CardContent className="p-0">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">
              {title}
            </h3>
            {icon && (
              <div className={cn('p-2 rounded-md', getStatusColor())}>
                {icon}
              </div>
            )}
          </div>

          {/* Value and Target */}
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {target && (
              <div className="text-sm text-gray-500">
                Target: {typeof target === 'number' ? target.toLocaleString() : target}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn('h-2 rounded-full transition-all duration-300', getProgressColor())}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export { MetricsCard, CompactMetrics, KPICard };