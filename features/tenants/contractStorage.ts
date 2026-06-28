import type { Contract } from './types';

const KEY = 'kos-map-contracts-v1';

export function loadContracts(): Contract[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Contract[]) : [];
  } catch {
    return [];
  }
}

export function saveContracts(contracts: Contract[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(contracts));
  } catch {
    // ignore storage errors
  }
}

export function addContract(contract: Contract): void {
  saveContracts([...loadContracts(), contract]);
}

export function getActiveContractByRoomId(roomId: string): Contract | null {
  return loadContracts().find(c => c.roomId === roomId && c.status === 'ACTIVE') ?? null;
}

export function finishContract(contractId: string, endDate?: string): void {
  const updated = loadContracts().map(c => {
    if (c.id !== contractId) return c;
    return endDate !== undefined
      ? { ...c, status: 'FINISHED' as const, endDate }
      : { ...c, status: 'FINISHED' as const };
  });
  saveContracts(updated);
}
