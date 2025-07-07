/**
 * Dashboard Settings Page
 * User preferences and application settings
 */

'use client';

import { Settings, User, Bell, Shield, Palette } from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';

export default function SettingsPage() {
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Settings', href: '/dashboard/settings' }
  ];

  const settingsCategories = [
    {
      id: 'profile',
      title: 'Profile Settings',
      description: 'Manage your personal information and preferences',
      icon: <User className="h-6 w-6" />,
      href: '/dashboard/profile'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure email and in-app notification preferences',
      icon: <Bell className="h-6 w-6" />,
      href: '/dashboard/settings/notifications'
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Password, two-factor authentication, and privacy settings',
      icon: <Shield className="h-6 w-6" />,
      href: '/dashboard/settings/security'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel of your dashboard',
      icon: <Palette className="h-6 w-6" />,
      href: '/dashboard/settings/appearance'
    }
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout
        title="Settings"
        breadcrumbs={breadcrumbs}
      >
        <Container>
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>

            {/* Settings Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {settingsCategories.map((category) => (
                <Card
                  key={category.id}
                  className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    // TODO: Implement navigation when routes are created
                    console.warn(`Settings navigation not yet implemented: ${category.href}`);
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Coming Soon Notice */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    Settings Implementation
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Detailed settings pages are planned for Phase 8 of the development roadmap.
                    Currently focused on core recruitment features.
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