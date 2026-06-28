'use client';

import { createContext, useContext } from 'react';
import type { UsageMode } from '@/types';

const UsageModeContext = createContext<UsageMode | undefined>(undefined);

export function UsageModeProvider({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: UsageMode;
}) {
  return (
    <UsageModeContext.Provider value={mode}>
      {children}
    </UsageModeContext.Provider>
  );
}

export function useUsageMode(): UsageMode {
  const ctx = useContext(UsageModeContext);
  if (ctx === undefined) {
    throw new Error('useUsageMode must be used within a UsageModeProvider');
  }
  return ctx;
}
