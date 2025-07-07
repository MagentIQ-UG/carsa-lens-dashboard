/**
 * ActivityFeed Component
 * Real-time activity feed for dashboard with enterprise design
 */

'use client';

import { 
  Activity,
  Briefcase, 
  Users, 
  ClipboardList, 
  UserPlus,
  FileText,
  Clock,
  Trash2
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/utils/time';

interface ActivityItem {
  id: string;
  type: 'job' | 'candidate' | 'evaluation' | 'user' | 'system';
  action: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    jobTitle?: string;
    candidateName?: string;
    evaluationScore?: number;
    status?: 'success' | 'warning' | 'error' | 'info';
  };
}

interface ActivityFeedProps {
  title?: string;
  maxItems?: number;
  showHeader?: boolean;
  realTime?: boolean;
  className?: string;
}

// Mock activity data - this would come from your API
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'job',
    action: 'created',
    description: 'Created new job posting for Senior Frontend Developer',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    user: { name: 'Sarah Johnson' },
    metadata: { jobTitle: 'Senior Frontend Developer', status: 'success' }
  },
  {
    id: '2',
    type: 'candidate',
    action: 'uploaded',
    description: 'Uploaded CV for John Smith via batch processing',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    user: { name: 'Mike Chen' },
    metadata: { candidateName: 'John Smith', status: 'success' }
  },
  {
    id: '3',
    type: 'evaluation',
    action: 'completed',
    description: 'AI evaluation completed for Marketing Manager position',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    user: { name: 'System' },
    metadata: { jobTitle: 'Marketing Manager', evaluationScore: 85, status: 'success' }
  },
  {
    id: '4',
    type: 'user',
    action: 'invited',
    description: 'Invited new team member to organization',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    user: { name: 'David Wilson' },
    metadata: { status: 'info' }
  },
  {
    id: '5',
    type: 'candidate',
    action: 'reviewed',
    description: 'Reviewed and shortlisted 3 candidates for Technical Lead role',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    user: { name: 'Emily Brown' },
    metadata: { jobTitle: 'Technical Lead', status: 'info' }
  },
  {
    id: '6',
    type: 'system',
    action: 'backup',
    description: 'Daily system backup completed successfully',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    metadata: { status: 'success' }
  }
];

const getActivityIcon = (type: string, action: string) => {
  switch (type) {
    case 'job':
      return Briefcase;
    case 'candidate':
      return action === 'uploaded' ? FileText : Users;
    case 'evaluation':
      return ClipboardList;
    case 'user':
      return action === 'invited' ? UserPlus : Users;
    case 'system':
      return Activity;
    default:
      return Activity;
  }
};

const getActivityColor = (status?: string) => {
  switch (status) {
    case 'success':
      return 'text-green-600 bg-green-50';
    case 'warning':
      return 'text-orange-600 bg-orange-50';
    case 'error':
      return 'text-red-600 bg-red-50';
    case 'info':
    default:
      return 'text-blue-600 bg-blue-50';
  }
};

export function ActivityFeed({
  title = 'Recent Activity',
  maxItems = 6,
  showHeader = true,
  realTime = true,
  className
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(mockActivities.slice(0, maxItems));
  const [isLive, setIsLive] = useState(realTime);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Randomly add new activities (simulated)
      if (Math.random() > 0.7) { // 30% chance every 10 seconds
        const newActivity: ActivityItem = {
          id: Date.now().toString(),
          type: 'system',
          action: 'updated',
          description: 'New candidate application received',
          timestamp: new Date(),
          metadata: { status: 'info' }
        };

        setActivities(prev => [newActivity, ...prev.slice(0, maxItems - 1)]);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isLive, maxItems]);

  const toggleLive = () => {
    setIsLive(!isLive);
  };

  const clearActivity = (id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  };

  return (
    <Card className={cn('h-full', className)}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {isLive && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Live</span>
                </div>
              )}
            </div>
            <button
              onClick={toggleLive}
              className={cn(
                'text-xs px-2 py-1 rounded-full font-medium transition-colors',
                isLive 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {isLive ? 'Live' : 'Paused'}
            </button>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={showHeader ? '' : 'pt-6'}>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No recent activity</p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type, activity.action);
              const colorClass = getActivityColor(activity.metadata?.status);
              
              return (
                <div key={activity.id} className="group relative">
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                      colorClass
                    )}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-medium">
                            {activity.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {activity.user && (
                              <span className="text-xs text-gray-500">
                                by {activity.user.name}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(activity.timestamp)} ago
                            </span>
                            {activity.metadata?.evaluationScore && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                Score: {activity.metadata.evaluationScore}%
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <button
                          onClick={() => clearActivity(activity.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="h-3 w-3 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Connector line */}
                  {index < activities.length - 1 && (
                    <div className="absolute left-4 top-8 w-px h-4 bg-gray-200"></div>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        {activities.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all activity →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ActivityFeed;