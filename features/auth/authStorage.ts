import type { UserRole } from './types';

const AUTH_KEY = 'kos-map-auth-v1';

function isValidRole(v: unknown): v is UserRole {
  return v === 'public' || v === 'penjaga' || v === 'owner';
}

export function loadRoleFromStorage(): UserRole | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { role?: unknown };
    return isValidRole(parsed.role) ? parsed.role : null;
  } catch {
    return null;
  }
}

export function saveRoleToStorage(role: UserRole): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ role }));
  } catch {
    // ignore storage errors
  }
}

export function clearRoleFromStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}
