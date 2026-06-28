import type { BoardingHouse, Floor } from '@/types';
import { DEFAULT_AMENITIES, DEFAULT_GALLERY_CATEGORIES } from '@/features/property/defaults';

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

    // Profile field normalizer — must be updated whenever BoardingHouse gains a new field
    data.tagline     = data.tagline     ?? '';
    data.description = data.description ?? '';
    data.type        = data.type        ?? 'MIXED';
    data.contact     = data.contact     ?? { whatsapp: '', phone: '', email: '' };
    data.address     = data.address     ?? { full: '' };
    data.amenities   = Array.isArray(data.amenities) ? data.amenities : DEFAULT_AMENITIES;
    data.rules       = Array.isArray(data.rules) ? data.rules : [];
    data.gallery     = data.gallery ?? { categories: DEFAULT_GALLERY_CATEGORIES };

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
