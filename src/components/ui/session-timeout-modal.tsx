/**
 * Session Timeout Modal Component
 * Warns users about session expiration and provides extend option
 */

'use client';

import { Clock, AlertTriangle } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useAuth } from '@/lib/auth/context';
import { formatTime } from '@/lib/utils/time';

import { Button } from './button';
import { Modal } from './modal';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtend: () => void;
  onLogout: () => void;
  timeRemaining: number; // in seconds
  _warningThreshold?: number; // show warning when this many seconds remain
}

export function SessionTimeoutModal({
  isOpen,
  onClose,
  onExtend,
  onLogout,
  timeRemaining,
  _warningThreshold = 300, // 5 minutes
}: SessionTimeoutModalProps) {
  const [countdown, setCountdown] = useState(timeRemaining);
  const [isExtending, setIsExtending] = useState(false);

  // Update countdown
  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Time's up - auto logout
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, countdown, onLogout]);

  // Reset countdown when timeRemaining changes
  useEffect(() => {
    setCountdown(timeRemaining);
  }, [timeRemaining]);

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      await onExtend();
      onClose();
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setIsExtending(false);
    }
  };

  const getWarningLevel = () => {
    if (countdown <= 60) return 'critical'; // 1 minute
    if (countdown <= 180) return 'high'; // 3 minutes
    return 'medium';
  };

  const getWarningColor = () => {
    const level = getWarningLevel();
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getIconColor = () => {
    const level = getWarningLevel();
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      default: return 'text-yellow-600';
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing by backdrop/escape
      closeOnBackdrop={false}
      closeOnEscape={false}
      showCloseButton={false}
      size="sm"
    >
      <div className="text-center">
        {/* Warning Icon */}
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${getWarningColor()}`}>
          {getWarningLevel() === 'critical' ? (
            <AlertTriangle className={`h-6 w-6 ${getIconColor()}`} />
          ) : (
            <Clock className={`h-6 w-6 ${getIconColor()}`} />
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {getWarningLevel() === 'critical' 
            ? 'Session Expiring Soon!' 
            : 'Session Timeout Warning'
          }
        </h3>

        {/* Message */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">
            Your session will expire in:
          </p>
          
          <div className={`inline-flex items-center px-3 py-2 rounded-lg text-lg font-bold ${getWarningColor()}`}>
            <Clock className={`h-5 w-5 mr-2 ${getIconColor()}`} />
            {formatTime(countdown)}
          </div>

          <p className="text-xs text-gray-500 mt-3">
            {getWarningLevel() === 'critical'
              ? 'You will be automatically logged out when the timer reaches zero.'
              : 'Please save your work and extend your session to continue.'
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleExtendSession}
            loading={isExtending}
            disabled={isExtending}
            className="w-full"
            variant={getWarningLevel() === 'critical' ? 'primary' : 'primary'}
          >
            {isExtending ? 'Extending...' : 'Extend Session'}
          </Button>
          
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full"
            disabled={isExtending}
          >
            Logout Now
          </Button>
        </div>

        {/* Additional info */}
        <div className="mt-6 p-3 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600">
            <strong>Security Notice:</strong> Sessions automatically expire to protect your account. 
            This helps prevent unauthorized access if you leave your computer unattended.
          </p>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Hook for session timeout management
 */
export function useSessionTimeout(options: {
  _warningThreshold?: number; // Show warning when this many seconds remain (default: 5 minutes)
  sessionDuration?: number; // Total session duration in seconds (default: 30 minutes)
  onTimeout?: () => void;
  onWarning?: () => void;
} = {}) {
  const {
    _warningThreshold = 300, // 5 minutes
    sessionDuration = 1800, // 30 minutes
    onTimeout,
    onWarning,
  } = options;

  const { refreshToken, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(sessionDuration);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
      setTimeRemaining(sessionDuration);
      setShowWarning(false);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [sessionDuration]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastActivity) / 1000);
      const remaining = Math.max(0, sessionDuration - elapsed);

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        // Session expired
        setShowWarning(false);
        onTimeout?.();
        logout();
      } else if (remaining <= _warningThreshold && !showWarning) {
        // Show warning
        setShowWarning(true);
        onWarning?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastActivity, sessionDuration, _warningThreshold, showWarning, onTimeout, onWarning, logout]);

  const extendSession = async () => {
    try {
      await refreshToken();
      setLastActivity(Date.now());
      setTimeRemaining(sessionDuration);
      setShowWarning(false);
    } catch (error) {
      console.error('Failed to extend session:', error);
      logout();
    }
  };

  const handleLogout = () => {
    setShowWarning(false);
    logout();
  };

  return {
    showWarning,
    timeRemaining,
    extendSession,
    logout: handleLogout,
    closeWarning: () => setShowWarning(false),
  };
}