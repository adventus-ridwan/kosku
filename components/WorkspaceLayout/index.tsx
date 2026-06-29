'use client';

import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDenahRoute = pathname?.startsWith('/workspace/denah') ?? false;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => isDenahRoute);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleCollapse = useCallback(() => setSidebarCollapsed(c => !c), []);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        open={sidebarOpen}
        onClose={closeSidebar}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuOpen={() => setSidebarOpen(true)} />
        <main className={[
          'flex-1',
          isDenahRoute ? 'overflow-hidden' : 'p-6 overflow-auto',
        ].join(' ')}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
