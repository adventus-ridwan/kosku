import type { BoardingHouse, Floor, Room, Facility, MapObject } from '@/types';
import { DEFAULT_AMENITIES, DEFAULT_GALLERY_CATEGORIES } from '@/features/property/defaults';
import { DEFAULT_ROOM_AMENITIES } from '@/features/rooms/defaults';

const STORAGE_KEY = 'kos-map-v1';

// Normalize a single Room: fill in any profile fields added after the data was first saved
function normalizeRoom(r: Room): Room {
  return {
    ...r,
    publishStatus: r.publishStatus ?? 'draft',
    description:   r.description   ?? '',
    roomAmenities: Array.isArray(r.roomAmenities) ? r.roomAmenities : DEFAULT_ROOM_AMENITIES,
  };
}

// Migrate a floor from the old silo format (rooms[] + facilities[]) to the unified objects[] format.
// If the floor already has objects[], normalize any rooms inside it instead.
function normalizeFloor(raw: unknown): Floor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const f = raw as any;

  if (Array.isArray(f.objects)) {
    // Already in unified format — only normalize Room profile fields
    return {
      id:   f.id,
      name: f.name,
      objects: (f.objects as MapObject[]).map(obj =>
        obj.kind === 'room' ? normalizeRoom(obj) : obj,
      ),
    };
  }

  // Old silo format — inject kind discriminants and merge into objects[]
  const rooms: Room[] = (Array.isArray(f.rooms) ? f.rooms : []).map((r: Room) =>
    normalizeRoom({ ...r, kind: 'room' }),
  );
  const facilities: Facility[] = (Array.isArray(f.facilities) ? f.facilities : []).map(
    (fac: Facility) => ({ ...fac, kind: 'facility' }),
  );

  return { id: f.id, name: f.name, objects: [...rooms, ...facilities] };
}

export function loadFromStorage(): BoardingHouse | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const data = JSON.parse(raw) as BoardingHouse;

    // Floor normalizer — update whenever Floor or its contained types gain new fields
    data.floors = data.floors.map(normalizeFloor);

    // Property profile normalizer — update whenever BoardingHouse gains a new field
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
