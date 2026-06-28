'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import type { UserRole } from '@/features/auth/types';

interface AccessGuardProps {
  canAccess: (role: UserRole | null) => boolean;
  notAuthorizedRedirect: string;
  notAuthenticatedRedirect?: string;
  children: React.ReactNode;
}

export function AccessGuard({
  canAccess,
  notAuthorizedRedirect,
  notAuthenticatedRedirect = '/login',
  children,
}: AccessGuardProps) {
  const { role, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(notAuthenticatedRedirect);
      return;
    }
    if (!canAccess(role)) {
      router.replace(notAuthorizedRedirect);
    }
  }, [isLoading, isAuthenticated, role, router, canAccess, notAuthorizedRedirect, notAuthenticatedRedirect]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-sm text-gray-400">Memuat…</span>
      </div>
    );
  }

  if (!isAuthenticated || !canAccess(role)) return null;

  return <>{children}</>;
}
