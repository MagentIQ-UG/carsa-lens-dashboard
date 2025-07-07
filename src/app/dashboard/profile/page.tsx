/**
 * User Profile Page
 * View and edit personal profile information
 */

'use client';

import { User as UserIcon, Mail, Phone, Building, Calendar, Edit } from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/lib/auth/context';
import type { User } from '@/types/api';

// Helper function to safely get user initials
const getUserInitials = (user: User | null): string => {
  if (!user) return 'U';
  
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  } else if (firstName) {
    return firstName[0].toUpperCase();
  } else if (lastName) {
    return lastName[0].toUpperCase();
  } else if (user.email) {
    return user.email[0].toUpperCase();
  }
  
  return 'U';
};

// Helper function to safely get user full name
const getUserFullName = (user: User | null): string => {
  if (!user) return 'Loading...';
  
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else if (user.email) {
    return user.email.split('@')[0]; // Use email username as fallback
  }
  
  return 'User Profile';
};

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  
  // Debug logging to understand the user object structure
  console.warn('Profile page user data:', user);
  
  // Show loading state while user data is being fetched
  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Profile">
          <Container>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading profile...</p>
              </div>
            </div>
          </Container>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile', href: '/dashboard/profile' }
  ];

  const profileSections = [
    {
      title: 'Personal Information',
      fields: [
        {
          label: 'Full Name',
          value: getUserFullName(user),
          icon: <UserIcon className="h-4 w-4" />
        },
        {
          label: 'Email Address',
          value: user?.email || 'Loading...',
          icon: <Mail className="h-4 w-4" />
        },
        {
          label: 'Phone Number',
          value: user?.phone || 'Not provided',
          icon: <Phone className="h-4 w-4" />
        }
      ]
    },
    {
      title: 'Organization',
      fields: [
        {
          label: 'Organization ID',
          value: user?.organization_id || 'Loading...',
          icon: <Building className="h-4 w-4" />
        },
        {
          label: 'Role',
          value: user?.role || 'Loading...',
          icon: <UserIcon className="h-4 w-4" />
        }
      ]
    },
    {
      title: 'Account Status',
      fields: [
        {
          label: 'Account Status',
          value: user?.is_active ? 'Active' : 'Inactive',
          icon: <UserIcon className="h-4 w-4" />
        },
        {
          label: 'Email Verified',
          value: user?.is_verified ? 'Verified' : 'Pending Verification',
          icon: <Mail className="h-4 w-4" />
        },
        {
          label: 'Member Since',
          value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Loading...',
          icon: <Calendar className="h-4 w-4" />
        }
      ]
    }
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout
        title="Profile"
        breadcrumbs={breadcrumbs}
      >
        <Container>
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {getUserInitials(user)}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {getUserFullName(user)}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {user?.email || 'Loading...'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                leftIcon={<Edit className="h-4 w-4" />}
                onClick={() => {
                  // TODO: Implement profile editing when form is created
                  console.warn('Profile editing not yet implemented');
                }}
              >
                Edit Profile
              </Button>
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {profileSections.map((section, sectionIndex) => (
                <Card key={sectionIndex} className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                  <div className="space-y-4">
                    {section.fields.map((field, fieldIndex) => (
                      <div key={fieldIndex} className="flex items-center space-x-3">
                        <div className="flex-shrink-0 text-gray-400">
                          {field.icon}
                        </div>
                        <div className="flex-1">
                          <dt className="text-sm font-medium text-gray-500">
                            {field.label}
                          </dt>
                          <dd className="text-sm text-gray-900 mt-1">
                            {field.value}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* Coming Soon Notice */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <Edit className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    Profile Editing
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Profile editing functionality will be implemented in Phase 8.
                    Currently displaying read-only profile information from your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  );
}