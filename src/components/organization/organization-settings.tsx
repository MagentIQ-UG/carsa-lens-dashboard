/**
 * Organization Settings Component
 * Comprehensive settings interface for organization management
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Building2, 
  Settings, 
  Save, 
  AlertTriangle,
  Trash2,
  Shield,
  Mail
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useOrganizationPermissions } from '@/lib/organization/context';
import { cn } from '@/lib/utils';
import { useCurrentOrganization, useOrganizationStore } from '@/stores/organization';
import { OrganizationSize } from '@/types/api';

const organizationSettingsSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
});

type OrganizationSettingsFormData = z.infer<typeof organizationSettingsSchema>;

interface OrganizationSettingsProps {
  onSave?: () => void;
  onCancel?: () => void;
  showHeader?: boolean;
}

export function OrganizationSettings({ 
  onSave, 
  onCancel, 
  showHeader = true 
}: OrganizationSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  
  const currentOrganization = useCurrentOrganization();
  const { updateOrganization } = useOrganizationStore();
  const { hasPermission } = useOrganizationPermissions();
  
  const canEditOrganization = hasPermission('org:update');
  const canDeleteOrganization = hasPermission('org:delete');

  const mapEnumToSize = (size: OrganizationSize | undefined): 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | undefined => {
    if (!size) return undefined;
    switch (size) {
      case OrganizationSize.STARTUP: return 'startup';
      case OrganizationSize.SMALL: return 'small';
      case OrganizationSize.MEDIUM: return 'medium';
      case OrganizationSize.LARGE: return 'large';
      case OrganizationSize.ENTERPRISE: return 'enterprise';
      default: return undefined;
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<OrganizationSettingsFormData>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: {
      name: currentOrganization?.name || '',
      description: currentOrganization?.description || '',
      website: currentOrganization?.website || '',
      industry: currentOrganization?.industry || '',
      size: mapEnumToSize(currentOrganization?.size),
      phone: currentOrganization?.phone || '',
      email: currentOrganization?.email || '',
      address: currentOrganization?.address || '',
      country: currentOrganization?.country || '',
      timezone: currentOrganization?.timezone || '',
    },
  });

  const mapSizeToEnum = (size: string | undefined): OrganizationSize | undefined => {
    if (!size) return undefined;
    switch (size) {
      case 'startup': return OrganizationSize.STARTUP;
      case 'small': return OrganizationSize.SMALL;
      case 'medium': return OrganizationSize.MEDIUM;
      case 'large': return OrganizationSize.LARGE;
      case 'enterprise': return OrganizationSize.ENTERPRISE;
      default: return undefined;
    }
  };

  const onSubmit = async (data: OrganizationSettingsFormData) => {
    if (!currentOrganization || !canEditOrganization) {
      toast.error('You do not have permission to edit this organization');
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        ...data,
        size: mapSizeToEnum(data.size),
      };
      await updateOrganization(currentOrganization.id, updateData);
      toast.success('Organization settings updated successfully');
      reset(data);
      onSave?.();
    } catch (error) {
      toast.error('Failed to update organization settings');
      console.error('Update organization error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  const handleDeleteOrganization = async () => {
    if (!currentOrganization || !canDeleteOrganization) {
      toast.error('You do not have permission to delete this organization');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${currentOrganization.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      // TODO: Implement organization deletion
      toast.error('Organization deletion not implemented yet');
    } catch (error) {
      toast.error('Failed to delete organization');
      console.error('Delete organization error:', error);
    }
  };

  if (!currentOrganization) {
    return (
      <div className="p-6 text-center">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Organization Selected
        </h3>
        <p className="text-gray-600">
          Please select an organization to view settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Settings className="h-6 w-6 mr-2" />
            Organization Settings
          </h2>
          <p className="text-gray-600 mt-1">
            Manage your organization's profile and configuration
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Basic Information
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  disabled={!canEditOrganization}
                  className={cn(
                    'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    !canEditOrganization && 'bg-gray-50 cursor-not-allowed',
                    errors.name && 'border-red-500'
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <input
                  {...register('industry')}
                  type="text"
                  disabled={!canEditOrganization}
                  placeholder="e.g., Technology, Healthcare, Finance"
                  className={cn(
                    'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    !canEditOrganization && 'bg-gray-50 cursor-not-allowed'
                  )}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                disabled={!canEditOrganization}
                placeholder="Brief description of your organization"
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  !canEditOrganization && 'bg-gray-50 cursor-not-allowed'
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  {...register('website')}
                  type="url"
                  disabled={!canEditOrganization}
                  placeholder="https://example.com"
                  className={cn(
                    'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    !canEditOrganization && 'bg-gray-50 cursor-not-allowed',
                    errors.website && 'border-red-500'
                  )}
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Size
                </label>
                <select
                  {...register('size')}
                  disabled={!canEditOrganization}
                  className={cn(
                    'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    !canEditOrganization && 'bg-gray-50 cursor-not-allowed'
                  )}
                >
                  <option value="">Select size</option>
                  <option value="startup">Startup (1-10 employees)</option>
                  <option value="small">Small (11-50 employees)</option>
                  <option value="medium">Medium (51-200 employees)</option>
                  <option value="large">Large (201-1000 employees)</option>
                  <option value="enterprise">Enterprise (1000+ employees)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact Information
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  disabled={!canEditOrganization}
                  placeholder="contact@example.com"
                  className={cn(
                    'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    !canEditOrganization && 'bg-gray-50 cursor-not-allowed',
                    errors.email && 'border-red-500'
                  )}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  disabled={!canEditOrganization}
                  placeholder="+1 (555) 123-4567"
                  className={cn(
                    'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    !canEditOrganization && 'bg-gray-50 cursor-not-allowed'
                  )}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                {...register('address')}
                rows={2}
                disabled={!canEditOrganization}
                placeholder="Street address, city, state, postal code"
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  !canEditOrganization && 'bg-gray-50 cursor-not-allowed'
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  {...register('country')}
                  type="text"
                  disabled={!canEditOrganization}
                  placeholder="United States"
                  className={cn(
                    'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    !canEditOrganization && 'bg-gray-50 cursor-not-allowed'
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select
                  {...register('timezone')}
                  disabled={!canEditOrganization}
                  className={cn(
                    'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    !canEditOrganization && 'bg-gray-50 cursor-not-allowed'
                  )}
                >
                  <option value="">Select timezone</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Shanghai">Shanghai</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {canEditOrganization && (
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={!isDirty || isSubmitting}
                leftIcon={isSubmitting ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
            </div>

            {canDeleteOrganization && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDangerZone(!showDangerZone)}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Danger Zone
              </Button>
            )}
          </div>
        )}
      </form>

      {/* Danger Zone */}
      {showDangerZone && canDeleteOrganization && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Danger Zone
          </h3>
          <p className="text-red-700 mb-4">
            Once you delete an organization, there is no going back. This will permanently delete the organization and all associated data.
          </p>
          <Button
            onClick={handleDeleteOrganization}
            variant="outline"
            className="bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700"
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete Organization
          </Button>
        </div>
      )}

      {!canEditOrganization && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">
              You do not have permission to edit organization settings. Contact your administrator for access.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}