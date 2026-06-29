'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { NAV_ITEMS } from '@/features/workspace/navConfig';
import type { UserRole } from '@/features/auth/types';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { role } = useAuth();

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  const visibleItems = NAV_ITEMS.filter(
    item => !item.roles || item.roles.includes(role as UserRole)
  );

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
          'fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-gray-200',
          'transition-all duration-200',
          'w-56',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0 lg:z-auto',
          collapsed ? 'lg:w-12' : 'lg:w-56',
        ].join(' ')}
      >
        {/* Brand */}
        <div className={[
          'h-14 flex items-center border-b border-gray-100 shrink-0 px-4',
          collapsed ? 'lg:justify-center lg:px-0' : '',
        ].join(' ')}>
          <span className={`text-sm font-bold text-gray-900 ${collapsed ? 'lg:hidden' : ''}`}>
            Kosku
          </span>
          {collapsed && (
            <span className="hidden lg:inline text-sm font-bold text-gray-900">K</span>
          )}
        </div>

        <nav className="flex-1 px-2 py-3 overflow-y-auto flex flex-col">
          <div className="flex-1">
            {visibleItems.map(item => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={[
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5',
                    collapsed ? 'lg:justify-center lg:gap-0 lg:px-0 lg:py-2.5' : '',
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  ].join(' ')}
                >
                  <span aria-hidden="true" className="shrink-0 leading-none">{item.icon}</span>
                  <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-gray-100 pt-3 mt-3 flex flex-col gap-0.5">
            {/* Collapse toggle — desktop only */}
            <button
              type="button"
              onClick={onToggleCollapse}
              title={collapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
              className={[
                'hidden lg:flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors',
                collapsed ? 'lg:justify-center lg:gap-0 lg:px-0 lg:py-2.5' : '',
              ].join(' ')}
            >
              <span aria-hidden="true" className="shrink-0 leading-none font-medium">
                {collapsed ? '›' : '‹'}
              </span>
              {!collapsed && <span>Perkecil</span>}
            </button>

            <a
              href="/kos"
              target="_blank"
              rel="noopener noreferrer"
              title="Lihat halaman publik"
              className={[
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors',
                collapsed ? 'lg:justify-center lg:gap-0 lg:px-0 lg:py-2.5' : '',
              ].join(' ')}
            >
              <span aria-hidden="true" className="shrink-0 leading-none">🌐</span>
              <span className={collapsed ? 'lg:hidden' : ''}>Lihat halaman publik</span>
            </a>
          </div>
        </nav>
      </aside>
    </>
  );
}
