'use client';

import { AuthProvider } from '@/features/auth/AuthContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
