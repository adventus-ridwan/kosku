'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuOpen={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
