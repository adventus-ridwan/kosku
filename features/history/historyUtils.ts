import type { ContractStatus } from '@/features/tenants/types';
import { loadContracts } from '@/features/tenants/contractStorage';
import { loadTenants } from '@/features/tenants/tenantStorage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  contractId: string;
  tenantName: string;
  gender: 'MALE' | 'FEMALE';
  startDate: string;
  endDate: string;
  durationDays: number;
  monthlyRent: number;
  status: ContractStatus;
}

export interface HistorySummary {
  totalContracts: number;
  lifetimeRevenue: number;
  averageStayDays: number;
}

// ─── Calculation helpers ──────────────────────────────────────────────────────

export function calculateDurationDays(startDate: string, endDate: string): number {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

export function formatDuration(days: number): string {
  if (days === 0) return '0 hari';
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  if (months === 0) return `${days} hari`;
  if (remainingDays === 0) return `${months} bln`;
  return `${months} bln ${remainingDays} hr`;
}

// Revenue formula from DATA_MODEL: monthlyRent × contract duration (in months).
export function calculateContractRevenue(monthlyRent: number, durationDays: number): number {
  return monthlyRent * (durationDays / 30);
}

// ─── Aggregate builders ───────────────────────────────────────────────────────

export function buildHistoryEntries(roomId: string): HistoryEntry[] {
  const contracts = loadContracts()
    .filter(c => c.roomId === roomId)
    .sort((a, b) => b.startDate.localeCompare(a.startDate)); // newest first

  const tenantMap = new Map(loadTenants().map(t => [t.id, t]));

  return contracts.map(c => {
    const tenant = tenantMap.get(c.tenantId);
    return {
      contractId: c.id,
      tenantName: tenant?.name ?? '—',
      gender: tenant?.gender ?? 'MALE',
      startDate: c.startDate,
      endDate: c.endDate,
      durationDays: calculateDurationDays(c.startDate, c.endDate),
      monthlyRent: c.monthlyRent,
      status: c.status,
    };
  });
}

export function buildHistorySummary(entries: HistoryEntry[]): HistorySummary {
  if (entries.length === 0) {
    return { totalContracts: 0, lifetimeRevenue: 0, averageStayDays: 0 };
  }
  const lifetimeRevenue = entries.reduce(
    (sum, e) => sum + calculateContractRevenue(e.monthlyRent, e.durationDays),
    0,
  );
  const averageStayDays = Math.round(
    entries.reduce((sum, e) => sum + e.durationDays, 0) / entries.length,
  );
  return { totalContracts: entries.length, lifetimeRevenue, averageStayDays };
}
