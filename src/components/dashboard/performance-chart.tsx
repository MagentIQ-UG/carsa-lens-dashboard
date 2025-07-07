/**
 * PerformanceChart Component
 * Interactive charts for dashboard performance metrics with Recharts
 */

'use client';

import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ChartType = 'line' | 'area' | 'bar' | 'pie';
type TimeRange = '7d' | '30d' | '90d' | '1y';

interface ChartDataPoint {
  name: string;
  value: number;
  secondary?: number;
  date?: string;
}

interface PerformanceChartProps {
  title: string;
  type?: ChartType;
  data: ChartDataPoint[];
  height?: number;
  showControls?: boolean;
  showTrend?: boolean;
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

// Mock data generator
const generateTimeSeriesData = (days: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.floor(Math.random() * 100) + 20,
      secondary: Math.floor(Math.random() * 50) + 10,
      date: date.toISOString()
    });
  }
  
  return data;
};

const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export function PerformanceChart({
  title,
  type = 'line',
  data,
  height = 300,
  showControls = true,
  showTrend = true,
  className,
  primaryColor = '#3B82F6',
  secondaryColor = '#10B981'
}: PerformanceChartProps) {
  const [chartType, setChartType] = useState<ChartType>(type);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  
  // Generate data based on time range
  const chartData = useMemo(() => {
    if (data.length > 0) return data;
    
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    return generateTimeSeriesData(days);
  }, [data, timeRange]);

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 2) return null;
    
    const firstValue = chartData[0].value;
    const lastValue = chartData[chartData.length - 1].value;
    const percentChange = ((lastValue - firstValue) / firstValue) * 100;
    
    return {
      value: Math.abs(percentChange),
      direction: percentChange >= 0 ? 'up' : 'down',
      isPositive: percentChange >= 0
    };
  }, [chartData]);

  const exportData = () => {
    const csvContent = [
      ['Date', 'Value', 'Secondary'],
      ...chartData.map(item => [item.name, item.value, item.secondary || ''])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderChart = (): React.ReactElement | null => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              fontSize={12}
              tick={{ fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={primaryColor}
              strokeWidth={2}
              dot={{ fill: primaryColor, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: primaryColor, strokeWidth: 2 }}
            />
            {chartData[0]?.secondary !== undefined && (
              <Line 
                type="monotone" 
                dataKey="secondary" 
                stroke={secondaryColor}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: secondaryColor, strokeWidth: 2, r: 4 }}
              />
            )}
          </LineChart>
        );
        
      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              fontSize={12}
              tick={{ fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={primaryColor}
              fill={primaryColor}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        );
        
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              fontSize={12}
              tick={{ fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="value" 
              fill={primaryColor}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
        
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          </PieChart>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {showTrend && trend && (
              <div className={cn(
                'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
                trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}>
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{trend.value.toFixed(1)}%</span>
              </div>
            )}
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-2">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
                <option value="1y">1 Year</option>
              </select>
              
              {/* Chart Type Selector */}
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as ChartType)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="line">Line</option>
                <option value="area">Area</option>
                <option value="bar">Bar</option>
                <option value="pie">Pie</option>
              </select>
              
              {/* Export Button */}
              <button
                onClick={exportData}
                className="p-1 hover:bg-gray-100 rounded"
                title="Export data"
              >
                <Download className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart() || <div>No chart available</div>}
          </ResponsiveContainer>
        </div>
        
        {chartType === 'pie' && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {chartData.map((item, index) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: pieColors[index % pieColors.length] }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PerformanceChart;