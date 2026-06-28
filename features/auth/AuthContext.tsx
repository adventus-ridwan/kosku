'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import type { UserRole, AuthContextValue } from './types';
import { loadRoleFromStorage, saveRoleToStorage, clearRoleFromStorage } from './authStorage';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Reducer ─────────────────────────────────────────────────────────────────

interface AuthState {
  role: UserRole | null;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'HYDRATE'; role: UserRole | null }
  | { type: 'SET_ROLE'; role: UserRole }
  | { type: 'CLEAR_ROLE' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'HYDRATE':
      return { role: action.role, isLoading: false };
    case 'SET_ROLE':
      return { ...state, role: action.role };
    case 'CLEAR_ROLE':
      return { ...state, role: null };
    default:
      return state;
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Start with role=null and isLoading=true so SSR and the first client render
  // produce identical output. localStorage is read only after mount via the
  // HYDRATE dispatch, which useReducer dispatch is not flagged by
  // react-hooks/set-state-in-effect.
  const [{ role, isLoading }, dispatch] = useReducer(authReducer, {
    role: null,
    isLoading: true,
  });

  useEffect(() => {
    dispatch({ type: 'HYDRATE', role: loadRoleFromStorage() });
  }, []);

  const isAuthenticated = role === 'penjaga' || role === 'owner';

  function login(newRole: UserRole) {
    dispatch({ type: 'SET_ROLE', role: newRole });
    saveRoleToStorage(newRole);
  }

  function logout() {
    dispatch({ type: 'CLEAR_ROLE' });
    clearRoleFromStorage();
  }

  function setRole(newRole: UserRole) {
    dispatch({ type: 'SET_ROLE', role: newRole });
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
