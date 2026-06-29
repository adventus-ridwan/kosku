'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import { usePropertyProfile } from '@/features/property/usePropertyProfile';
import { Breadcrumb } from './Breadcrumb';

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  penjaga: 'Penjaga',
};

interface HeaderProps {
  onMenuOpen: () => void;
}

export function Header({ onMenuOpen }: HeaderProps) {
  const { role, logout } = useAuth();
  const { boardingHouse, isLoading: profileLoading } = usePropertyProfile();
  const router = useRouter();
  const propertyName = !profileLoading ? (boardingHouse.name || 'Properti') : 'Properti';

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <header className="h-14 shrink-0 flex items-center gap-3 px-4 border-b border-gray-200 bg-white">
      <button
        type="button"
        onClick={onMenuOpen}
        className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
        aria-label="Buka menu"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Property switcher — single-property MVP; no interactivity until multi-property is built */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 cursor-default select-none shrink-0 max-w-[160px]"
        title="Multi-property support coming soon"
        aria-disabled="true"
      >
        <span className="text-sm font-medium text-gray-700 truncate">{propertyName}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <a
          href="/kos"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          Preview Publik ↗
        </a>
        <div className="hidden sm:block w-px h-3.5 bg-gray-200" aria-hidden="true" />
        {role && (
          <>
            <span className="hidden sm:block text-xs text-gray-400">{ROLE_LABEL[role] ?? role}</span>
            <div className="hidden sm:block w-px h-3.5 bg-gray-200" aria-hidden="true" />
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
    </header>
  );
}
