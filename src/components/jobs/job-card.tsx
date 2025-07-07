/**
 * JobCard Component
 * Professional job card for displaying job listings
 */

'use client';

import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  Share,
  Pause,
  Play,
  Building,
  AlertCircle
} from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/utils/time';
import {
  JobResponse,
  JobStatus,
  JobType,
  JobMode,
  SeniorityLevel,
} from '@/types/api';

interface JobCardProps {
  job: JobResponse;
  onView?: (job: JobResponse) => void;
  onEdit?: (job: JobResponse) => void;
  onDelete?: (job: JobResponse) => void;
  onToggleStatus?: (job: JobResponse) => void;
  onDuplicate?: (job: JobResponse) => void;
  onShare?: (job: JobResponse) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case JobStatus.ACTIVE:
      return 'success';
    case JobStatus.DRAFT:
      return 'secondary';
    case JobStatus.PAUSED:
      return 'warning';
    case JobStatus.CLOSED:
      return 'error';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: JobStatus) => {
  switch (status) {
    case JobStatus.ACTIVE:
      return 'Active';
    case JobStatus.DRAFT:
      return 'Draft';
    case JobStatus.PAUSED:
      return 'Paused';
    case JobStatus.CLOSED:
      return 'Closed';
    default:
      return status;
  }
};

const formatJobType = (type: JobType) => {
  switch (type) {
    case JobType.FULL_TIME:
      return 'Full-time';
    case JobType.PART_TIME:
      return 'Part-time';
    case JobType.CONTRACT:
      return 'Contract';
    case JobType.TEMPORARY:
      return 'Temporary';
    case JobType.INTERNSHIP:
      return 'Internship';
    case JobType.FREELANCE:
      return 'Freelance';
    default:
      return type;
  }
};

const formatJobMode = (mode: JobMode) => {
  switch (mode) {
    case JobMode.ON_SITE:
      return 'On-site';
    case JobMode.REMOTE:
      return 'Remote';
    case JobMode.HYBRID:
      return 'Hybrid';
    default:
      return mode;
  }
};

const formatSeniorityLevel = (level: SeniorityLevel) => {
  switch (level) {
    case SeniorityLevel.ENTRY:
      return 'Entry Level';
    case SeniorityLevel.JUNIOR:
      return 'Junior';
    case SeniorityLevel.MID:
      return 'Mid-level';
    case SeniorityLevel.SENIOR:
      return 'Senior';
    case SeniorityLevel.LEAD:
      return 'Lead';
    case SeniorityLevel.PRINCIPAL:
      return 'Principal';
    case SeniorityLevel.EXECUTIVE:
      return 'Executive';
    default:
      return level;
  }
};

const formatSalaryRange = (min?: number, max?: number, currency: string = 'USD') => {
  if (!min && !max) return null;
  
  const format = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (min && max) {
    return `${format(min)} - ${format(max)}`;
  } else if (min) {
    return `From ${format(min)}`;
  } else if (max) {
    return `Up to ${format(max)}`;
  }
  
  return null;
};

export function JobCard({
  job,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onDuplicate,
  onShare,
  showActions = true,
  compact = false,
  className,
}: JobCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleCardClick = () => {
    onView?.(job);
  };

  const salaryRange = formatSalaryRange(job.salary_min, job.salary_max, job.salary_currency);
  const isActive = job.status === JobStatus.ACTIVE;
  const isDraft = job.status === JobStatus.DRAFT;
  const isPaused = job.status === JobStatus.PAUSED;

  const menuActions = [
    {
      icon: Eye,
      label: 'View Details',
      onClick: () => onView?.(job),
    },
    {
      icon: Edit,
      label: 'Edit Job',
      onClick: () => onEdit?.(job),
    },
    {
      icon: Copy,
      label: 'Duplicate',
      onClick: () => onDuplicate?.(job),
    },
    {
      icon: Share,
      label: 'Share',
      onClick: () => onShare?.(job),
    },
    {
      icon: isPaused ? Play : Pause,
      label: isPaused ? 'Resume Job' : 'Pause Job',
      onClick: () => onToggleStatus?.(job),
      disabled: isDraft,
    },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: () => onDelete?.(job),
      className: 'text-red-600 hover:bg-red-50',
    },
  ];

  return (
    <Card className={cn(
      'hover:shadow-md transition-shadow cursor-pointer relative group',
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0" onClick={handleCardClick}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {job.title}
                  </h3>
                  <Badge variant={getStatusColor(job.status)} size="sm">
                    {getStatusLabel(job.status)}
                  </Badge>
                  {isDraft && (
                    <div title="Draft - not visible to candidates">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span>{job.department}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Posted {formatDistanceToNow(new Date(job.created_at))} ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge outlined size="sm">
                {formatJobType(job.job_type)}
              </Badge>
              <Badge outlined size="sm">
                {formatJobMode(job.job_mode)}
              </Badge>
              <Badge outlined size="sm">
                {formatSeniorityLevel(job.seniority_level)}
              </Badge>
              {salaryRange && (
                <Badge outlined size="sm" className="text-green-700 border-green-200">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {salaryRange}
                </Badge>
              )}
            </div>

            {/* Description Preview */}
            {job.description && !compact && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {job.description}
              </p>
            )}

            {/* Metrics */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>Active</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{job.status}</span>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                ID: {job.id.slice(0, 8)}...
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {showActions && (
            <div className="relative ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>

              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  />
                  
                  {/* Menu */}
                  <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                    {menuActions.map((action, index) => {
                      const ActionIcon = action.icon;
                      return (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick();
                            setShowMenu(false);
                          }}
                          disabled={action.disabled}
                          className={cn(
                            'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors',
                            action.disabled && 'opacity-50 cursor-not-allowed',
                            action.className
                          )}
                        >
                          <ActionIcon className="h-4 w-4" />
                          <span>{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions Bar */}
        {!compact && isActive && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(job);
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(job);
                }}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                Last updated {formatDistanceToNow(new Date(job.updated_at))} ago
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default JobCard;