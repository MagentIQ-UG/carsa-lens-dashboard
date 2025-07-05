/**
 * Invite User Modal Component
 * Modal for inviting new users to the organization with role selection
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X, Mail, UserPlus, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useOrganizationPermissions } from '@/lib/organization/context';
import { cn } from '@/lib/utils';
import { useCurrentOrganization, useOrganizationStore } from '@/stores/organization';
import { UserRole } from '@/types/api';

const inviteUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum([UserRole.ADMIN, UserRole.HR, UserRole.USER], {
    required_error: 'Please select a role'
  }),
  message: z.string().optional(),
});

type InviteUserFormData = z.infer<typeof inviteUserSchema>;

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteUserModal({ isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentOrganization = useCurrentOrganization();
  const { inviteUser } = useOrganizationStore();
  const { canInviteUsers } = useOrganizationPermissions();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      role: UserRole.USER,
      message: '',
    },
  });

  const selectedRole = watch('role');

  // Role descriptions - only for roles that can be assigned via invitation
  const roleDescriptions: Record<UserRole.ADMIN | UserRole.HR | UserRole.USER, string> = {
    [UserRole.ADMIN]: 'Full access to organization settings, user management, and all recruitment features',
    [UserRole.HR]: 'Access to job management, candidate evaluation, and recruitment analytics',
    [UserRole.USER]: 'Basic access to view jobs, candidates, and participate in evaluations',
  };

  const roleColors: Record<UserRole.ADMIN | UserRole.HR | UserRole.USER, string> = {
    [UserRole.ADMIN]: 'border-blue-200 bg-blue-50',
    [UserRole.HR]: 'border-green-200 bg-green-50', 
    [UserRole.USER]: 'border-gray-200 bg-gray-50',
  };

  const onSubmit = async (data: InviteUserFormData) => {
    if (!currentOrganization || !canInviteUsers) {
      toast.error('You do not have permission to invite users');
      return;
    }

    setIsSubmitting(true);
    try {
      await inviteUser(data.email, data.role);
      toast.success(`Invitation sent to ${data.email}`);
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to send invitation');
      console.error('Invite user error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Invite User
              </h3>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Organization Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Inviting to: {currentOrganization?.name}
              </h4>
              <p className="text-sm text-blue-700">
                The user will receive an email invitation to join your organization.
              </p>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="user@example.com"
                  disabled={isSubmitting}
                  className={cn(
                    'w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    errors.email && 'border-red-500',
                    isSubmitting && 'bg-gray-50 cursor-not-allowed'
                  )}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Role *
              </label>
              <div className="space-y-3">
                {[UserRole.ADMIN, UserRole.HR, UserRole.USER].map((role) => (
                  <label 
                    key={role}
                    className={cn(
                      'relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors',
                      selectedRole === role 
                        ? `${roleColors[role as keyof typeof roleColors]} border-2` 
                        : 'border-gray-200 hover:bg-gray-50',
                      isSubmitting && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <input
                      {...register('role')}
                      type="radio"
                      value={role}
                      disabled={isSubmitting}
                      className="sr-only"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {role === UserRole.HR ? 'HR Manager' : role}
                        </span>
                        {selectedRole === role && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {roleDescriptions[role as keyof typeof roleDescriptions]}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Custom Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Message (Optional)
              </label>
              <textarea
                {...register('message')}
                rows={3}
                placeholder="Add a personal message to the invitation..."
                disabled={isSubmitting}
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  isSubmitting && 'bg-gray-50 cursor-not-allowed'
                )}
              />
            </div>

            {/* Permission Warning */}
            {!canInviteUsers && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-800">
                    You do not have permission to invite users to this organization.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !canInviteUsers}
                leftIcon={isSubmitting ? <LoadingSpinner size="sm" /> : <Mail className="h-4 w-4" />}
              >
                {isSubmitting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}