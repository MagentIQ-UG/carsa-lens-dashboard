/**
 * Access Denied Page
 * Displayed when users don't have permission to access a route
 */

'use client';

import { AccessDenied } from '@/components/auth/access-denied';

// Force dynamic rendering since this page uses auth context
export const dynamic = 'force-dynamic';

export default function AccessDeniedPage() {
  return (
    <AccessDenied 
      message="You don't have permission to access this page."
      showContactAdmin={true}
    />
  );
}