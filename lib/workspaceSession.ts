import type { AppMode } from '@/types';

export interface WorkspaceSession {
  version: 1;
  activePropertyId: string;
  activeFloorId: string;
  selectedObjectId: string | null;
  mode: AppMode;
}

const STORAGE_KEY = 'kosku-workspace-session';

export function loadWorkspaceSession(): WorkspaceSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkspaceSession;
    // Discard sessions from incompatible schema versions
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveWorkspaceSession(session: WorkspaceSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Silently ignore QuotaExceededError and similar
  }
}
