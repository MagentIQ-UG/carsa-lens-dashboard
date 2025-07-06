/**
 * Accept Invitation Page
 * Page for users to accept organization invitations
 */

'use client';

// Force dynamic rendering for this page since it uses query params and auth context
export const dynamic = 'force-dynamic';

import { Building2, CheckCircle, XCircle, Clock, Mail, Shield } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { UserRole } from '@/types/api';

interface InvitationDetails {
  id: string;
  email: string;
  organization_name: string;
  organization_slug: string;
  role: UserRole;
  invited_by: string;
  created_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
}

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  const fetchInvitationDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await apiGet(`/invitations/validate/${token}`);
      // setInvitation(response);
      
      // Mock invitation data for demonstration
      const mockInvitation: InvitationDetails = {
        id: token!,
        email: 'user@example.com',
        organization_name: 'Acme Corporation',
        organization_slug: 'acme-corp',
        role: UserRole.HR,
        invited_by: 'admin@acme.com',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      };
      
      setInvitation(mockInvitation);
    } catch (error) {
      console.error('Failed to fetch invitation details:', error);
      setError('Failed to load invitation details. The invitation may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setIsLoading(false);
      return;
    }

    fetchInvitationDetails();
  }, [token, fetchInvitationDetails]);

  const handleAcceptInvitation = async () => {
    if (!invitation) return;

    setIsAccepting(true);
    try {
      // TODO: Replace with actual API call
      // await apiPost(`/invitations/${invitation.id}/accept`);
      
      // Mock acceptance
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Invitation accepted successfully!');
      
      // Redirect to organization dashboard or login
      router.push('/login?redirect=/dashboard&organization=' + invitation.organization_slug);
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      toast.error('Failed to accept invitation. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!invitation) return;

    const confirmed = window.confirm(
      'Are you sure you want to decline this invitation? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      // TODO: Replace with actual API call
      // await apiPost(`/invitations/${invitation.id}/decline`);
      
      toast.success('Invitation declined');
      router.push('/');
    } catch (error) {
      console.error('Failed to decline invitation:', error);
      toast.error('Failed to decline invitation. Please try again.');
    }
  };

  const isExpired = invitation && new Date(invitation.expires_at) < new Date();
  const isInvalidStatus = invitation && invitation.status !== 'pending';

  // Role display names
  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.OWNER: return 'Owner';
      case UserRole.ADMIN: return 'Administrator';
      case UserRole.HR: return 'HR Manager';
      case UserRole.USER: return 'User';
      default: return role;
    }
  };

  // Get time remaining
  const getTimeRemaining = () => {
    if (!invitation) return null;
    
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'This invitation link is invalid or has expired.'}
          </p>
          <Button onClick={() => router.push('/')}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (isExpired || isInvalidStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isExpired ? 'Invitation Expired' : 'Invitation No Longer Available'}
          </h1>
          <p className="text-gray-600 mb-6">
            {isExpired 
              ? 'This invitation has expired. Please contact the organization administrator for a new invitation.'
              : `This invitation is ${invitation.status}. Please contact the organization administrator if you need assistance.`
            }
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/')}>
              Go to Home
            </Button>
            <p className="text-sm text-gray-500">
              Need help? Contact {invitation.invited_by}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const timeRemaining = getTimeRemaining();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center h-12 w-12 bg-white bg-opacity-20 rounded-lg">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Organization Invitation
              </h1>
              <p className="text-blue-100">
                You've been invited to join an organization
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Invitation Details */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <Mail className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Join {invitation.organization_name}
              </h2>
              <p className="text-gray-600">
                You've been invited to join as a <span className="font-medium">{getRoleDisplayName(invitation.role)}</span>
              </p>
            </div>

            {/* Invitation Info */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Organization
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{invitation.organization_name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{invitation.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Shield className="h-4 w-4 mr-1" />
                      {getRoleDisplayName(invitation.role)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Invited By
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{invitation.invited_by}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Invitation Expires
                  </label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-900">
                      {new Date(invitation.expires_at).toLocaleDateString()}
                    </span>
                    {timeRemaining && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        timeRemaining.includes('soon') || timeRemaining === 'Expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {timeRemaining}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role Description */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              What you'll be able to do as a {getRoleDisplayName(invitation.role)}:
            </h3>
            <div className="text-sm text-blue-800">
              {invitation.role === UserRole.ADMIN && (
                <ul className="list-disc list-inside space-y-1">
                  <li>Manage organization settings and users</li>
                  <li>Full access to all recruitment features</li>
                  <li>Create and manage job postings</li>
                  <li>Review and evaluate candidates</li>
                  <li>Access analytics and reports</li>
                </ul>
              )}
              {invitation.role === UserRole.HR && (
                <ul className="list-disc list-inside space-y-1">
                  <li>Create and manage job postings</li>
                  <li>Review and evaluate candidates</li>
                  <li>Access recruitment analytics</li>
                  <li>Manage candidate pipeline</li>
                  <li>Generate recruitment reports</li>
                </ul>
              )}
              {invitation.role === UserRole.USER && (
                <ul className="list-disc list-inside space-y-1">
                  <li>View job postings and candidates</li>
                  <li>Participate in candidate evaluations</li>
                  <li>Access basic recruitment features</li>
                  <li>View assigned tasks and activities</li>
                </ul>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              onClick={handleAcceptInvitation}
              disabled={isAccepting}
              className="w-full"
              leftIcon={isAccepting ? <LoadingSpinner size="sm" /> : <CheckCircle className="h-4 w-4" />}
            >
              {isAccepting ? 'Accepting Invitation...' : 'Accept Invitation'}
            </Button>
            
            <Button
              onClick={handleDeclineInvitation}
              variant="outline"
              className="w-full text-gray-600 hover:text-gray-800"
              disabled={isAccepting}
            >
              Decline Invitation
            </Button>

            <p className="text-xs text-center text-gray-500">
              By accepting this invitation, you agree to join {invitation.organization_name} 
              and abide by their terms and policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}