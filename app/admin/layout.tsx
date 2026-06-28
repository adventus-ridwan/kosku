'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { useAuth } from '@/features/auth/useAuth';

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  penjaga: 'Penjaga',
};

function AdminContent({ children }: { children: React.ReactNode }) {
  const { logout, role } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="relative">
      {children}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md px-4 py-2">
        {role && (
          <>
            <span className="text-xs text-gray-500">{ROLE_LABEL[role] ?? role}</span>
            <div className="w-px h-3 bg-gray-200" aria-hidden />
          </>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminContent>{children}</AdminContent>
    </ProtectedRoute>
  );
}
