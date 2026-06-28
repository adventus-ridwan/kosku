import type { BoardingHouse, Floor } from '@/types';

const STORAGE_KEY = 'kos-map-v1';

export function loadFromStorage(): BoardingHouse | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const data = JSON.parse(raw) as BoardingHouse;
    // Normalize floors from older saved data that predate the facilities field
    data.floors = data.floors.map((f): Floor => ({
      ...f,
      facilities: Array.isArray(f.facilities) ? f.facilities : [],
    }));
    return data;
  } catch {
    return null;
  }
}

export function saveToStorage(data: BoardingHouse): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently ignore QuotaExceededError and similar
  }
}

export function clearStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
