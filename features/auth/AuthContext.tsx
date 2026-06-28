'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { UserRole, AuthContextValue } from './types';
import { loadRoleFromStorage, saveRoleToStorage, clearRoleFromStorage } from './authStorage';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = loadRoleFromStorage();
    if (stored) setRoleState(stored);
    setIsLoading(false);
  }, []);

  const isAuthenticated = !isLoading && (role === 'penjaga' || role === 'owner');

  function login(newRole: UserRole) {
    setRoleState(newRole);
    saveRoleToStorage(newRole);
  }

  function logout() {
    setRoleState(null);
    clearRoleFromStorage();
  }

  function setRole(newRole: UserRole) {
    setRoleState(newRole);
    saveRoleToStorage(newRole);
  }

  return (
    <AuthContext.Provider value={{ role, isAuthenticated, isLoading, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}
