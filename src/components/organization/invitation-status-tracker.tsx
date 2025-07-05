/**
 * Invitation Status Tracker Component
 * Timeline and status tracking for individual invitations
 */

'use client';

import { Clock, Mail, CheckCircle, XCircle, RefreshCw, Calendar, User, ExternalLink } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/api';

interface InvitationStatusTrackerProps {
  invitation: {
    id: string;
    email: string;
    role: UserRole;
    status: 'pending' | 'accepted' | 'expired' | 'cancelled';
    created_at: string;
    expires_at: string;
    invited_by: string;
    accepted_at?: string;
    cancelled_at?: string;
    resent_count?: number;
    last_resent_at?: string;
    resent_history?: Array<{
      date: string;
      resent_by: string;
    }>;
  };
  showActions?: boolean;
  onResend?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function InvitationStatusTracker({ 
  invitation, 
  showActions = true,
  onResend,
  onCancel,
  isLoading = false
}: InvitationStatusTrackerProps) {
  const [showTimeline, setShowTimeline] = useState(false);

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (invitation.status !== 'pending') return null;
    
    const now = new Date();
    const expiryDate = new Date(invitation.expires_at);
    const timeDiff = expiryDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) return 'Expired';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    } else {
      return 'Expires soon';
    }
  };

  // Generate timeline events
  const getTimelineEvents = () => {
    const events = [];

    // Invitation sent
    events.push({
      type: 'sent',
      date: invitation.created_at,
      title: 'Invitation Sent',
      description: `Invitation sent to ${invitation.email}`,
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    });

    // Resend events
    if (invitation.resent_history && invitation.resent_history.length > 0) {
      invitation.resent_history.forEach((resend, index) => {
        events.push({
          type: 'resent',
          date: resend.date,
          title: `Invitation Resent ${index > 0 ? `(${index + 1})` : ''}`,
          description: `Resent by ${resend.resent_by}`,
          icon: RefreshCw,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        });
      });
    } else if (invitation.resent_count && invitation.resent_count > 0 && invitation.last_resent_at) {
      events.push({
        type: 'resent',
        date: invitation.last_resent_at,
        title: `Invitation Resent ${invitation.resent_count > 1 ? `(${invitation.resent_count} times)` : ''}`,
        description: `Last resent on ${new Date(invitation.last_resent_at).toLocaleDateString()}`,
        icon: RefreshCw,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      });
    }

    // Final status events
    if (invitation.status === 'accepted' && invitation.accepted_at) {
      events.push({
        type: 'accepted',
        date: invitation.accepted_at,
        title: 'Invitation Accepted',
        description: `${invitation.email} joined the organization`,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      });
    } else if (invitation.status === 'cancelled' && invitation.cancelled_at) {
      events.push({
        type: 'cancelled',
        date: invitation.cancelled_at,
        title: 'Invitation Cancelled',
        description: 'Invitation was cancelled by administrator',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      });
    } else if (invitation.status === 'expired') {
      events.push({
        type: 'expired',
        date: invitation.expires_at,
        title: 'Invitation Expired',
        description: 'Invitation expired without being accepted',
        icon: Clock,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      });
    }

    // Sort by date
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const timeRemaining = getTimeRemaining();
  const timelineEvents = getTimelineEvents();

  // Status configuration
  const statusConfig = {
    pending: {
      label: 'Pending',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
      icon: Clock
    },
    accepted: {
      label: 'Accepted',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      icon: CheckCircle
    },
    expired: {
      label: 'Expired',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      icon: XCircle
    },
    cancelled: {
      label: 'Cancelled',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
      icon: XCircle
    }
  };

  const currentStatus = statusConfig[invitation.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className={cn(
      'bg-white border rounded-lg p-6',
      currentStatus.borderColor
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={cn(
            'flex items-center justify-center h-10 w-10 rounded-full',
            currentStatus.bgColor
          )}>
            <StatusIcon className={cn('h-5 w-5', currentStatus.color)} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {invitation.email}
            </h3>
            <p className="text-sm text-gray-600">
              Invited as {invitation.role === UserRole.HR ? 'HR Manager' : invitation.role}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
            currentStatus.bgColor,
            currentStatus.color
          )}>
            <StatusIcon className="h-4 w-4 mr-1" />
            {currentStatus.label}
          </span>
          {timeRemaining && invitation.status === 'pending' && (
            <p className={cn(
              'text-xs mt-1',
              timeRemaining.includes('soon') || timeRemaining === 'Expired' 
                ? 'text-red-600' 
                : 'text-gray-500'
            )}>
              {timeRemaining}
            </p>
          )}
        </div>
      </div>

      {/* Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Sent: {new Date(invitation.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span>Expires: {new Date(invitation.expires_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <User className="h-4 w-4 mr-2" />
          <span>By: {invitation.invited_by}</span>
        </div>
      </div>

      {/* Additional Stats */}
      {(invitation.resent_count || invitation.accepted_at || invitation.cancelled_at) && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {invitation.resent_count && invitation.resent_count > 0 && (
              <div>
                <span className="font-medium text-gray-700">Resent Count:</span>
                <span className="ml-2 text-gray-600">{invitation.resent_count} time(s)</span>
              </div>
            )}
            {invitation.accepted_at && (
              <div>
                <span className="font-medium text-gray-700">Accepted:</span>
                <span className="ml-2 text-gray-600">{new Date(invitation.accepted_at).toLocaleDateString()}</span>
              </div>
            )}
            {invitation.cancelled_at && (
              <div>
                <span className="font-medium text-gray-700">Cancelled:</span>
                <span className="ml-2 text-gray-600">{new Date(invitation.cancelled_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline Toggle */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTimeline(!showTimeline)}
          className="text-gray-600 hover:text-gray-800"
        >
          {showTimeline ? 'Hide' : 'Show'} Timeline
        </Button>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            {invitation.status === 'pending' && onResend && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResend}
                disabled={isLoading}
                leftIcon={isLoading ? <LoadingSpinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
              >
                Resend
              </Button>
            )}
            
            {(invitation.status === 'pending' || invitation.status === 'expired') && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                Cancel
              </Button>
            )}

            {invitation.status === 'pending' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Copy invitation link to clipboard
                  const inviteLink = `${window.location.origin}/accept-invitation?token=${invitation.id}`;
                  navigator.clipboard.writeText(inviteLink);
                  alert('Invitation link copied to clipboard');
                }}
                leftIcon={<ExternalLink className="h-4 w-4" />}
              >
                Copy Link
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      {showTimeline && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Invitation Timeline</h4>
          <div className="space-y-4">
            {timelineEvents.map((event, index) => {
              const EventIcon = event.icon;
              const isLast = index === timelineEvents.length - 1;
              
              return (
                <div key={`${event.type}-${event.date}`} className="relative flex items-start">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-4 top-8 w-0.5 h-6 bg-gray-200" />
                  )}
                  
                  {/* Icon */}
                  <div className={cn(
                    'flex items-center justify-center h-8 w-8 rounded-full border-2 border-white',
                    event.bgColor
                  )}>
                    <EventIcon className={cn('h-4 w-4', event.color)} />
                  </div>
                  
                  {/* Content */}
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-gray-900">
                        {event.title}
                      </h5>
                      <span className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}