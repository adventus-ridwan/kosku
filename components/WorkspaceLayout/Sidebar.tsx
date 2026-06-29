'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { NAV_ITEMS } from '@/features/workspace/navConfig';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 w-56 flex flex-col bg-white border-r border-gray-200',
          'transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0 lg:z-auto',
        ].join(' ')}
      >
        <div className="h-14 flex items-center px-4 border-b border-gray-100 shrink-0">
          <span className="text-sm font-bold text-gray-900">Kosku</span>
        </div>

        <nav className="flex-1 px-2 py-3 overflow-y-auto flex flex-col">
          <div className="flex-1">
            {NAV_ITEMS.map(item => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5',
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  ].join(' ')}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-gray-100 pt-3 mt-3">
            <a
              href="/kos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              <span aria-hidden="true">🌐</span>
              <span>Lihat halaman publik</span>
            </a>
          </div>
        </nav>
      </aside>
    </>
  );
}
