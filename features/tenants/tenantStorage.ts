import type { Tenant } from './types';

const KEY = 'kos-map-tenants-v1';

export function loadTenants(): Tenant[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Tenant[]) : [];
  } catch {
    return [];
  }
}

export function saveTenants(tenants: Tenant[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(tenants));
  } catch {
    // ignore storage errors
  }
}

export function addTenant(tenant: Tenant): void {
  saveTenants([...loadTenants(), tenant]);
}

export function getTenantById(id: string): Tenant | null {
  return loadTenants().find(t => t.id === id) ?? null;
}
