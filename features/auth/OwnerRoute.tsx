'use client';

import { AccessGuard } from '@/components/AccessGuard';
import { canAccessWorkspace } from './permission';

export function OwnerRoute({ children }: { children: React.ReactNode }) {
  return (
    <AccessGuard
      canAccess={canAccessWorkspace}
      notAuthorizedRedirect="/admin"
    >
      {children}
    </AccessGuard>
  );
}
