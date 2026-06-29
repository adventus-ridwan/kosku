import type { BoardingHouse, Floor, Room, Facility, MapObject, RoomType, RoomAmenity } from '@/types';
import { DEFAULT_AMENITIES, DEFAULT_GALLERY_CATEGORIES } from '@/features/property/defaults';
import { DEFAULT_ROOM_AMENITIES } from '@/features/rooms/defaults';

const STORAGE_KEY = 'kos-map-v1';
const CURRENT_SCHEMA_VERSION = 2;

// ─── Schema migrations ────────────────────────────────────────────────────────
//
// Each migration is a pure function from BoardingHouse → BoardingHouse.
// applyMigrations() runs them in version order, exactly once, persisting the
// result so subsequent loads skip already-applied migrations.
//
// How to add a future migration:
//   1. Write `function migrateToVN(data: BoardingHouse): BoardingHouse { ... }`
//   2. Add entry `N: migrateToVN` to MIGRATIONS.
//   3. Bump CURRENT_SCHEMA_VERSION to N.

type MigrationFn = (data: BoardingHouse) => BoardingHouse;

// V2: Remove false overrides introduced by the v1 normalizer and the old `price` field.
//
// Problem 1 — price: the old model had `room.price: number` (required). The v1 normalizer
// copied it to `priceOverride`, making every existing room appear to have a deliberate
// price override even though the concept didn't exist before v2.
// Detection: `raw.price` still present in stored JSON AND equals the current `priceOverride`.
//
// Problem 2 — amenities: the v1 normalizer forced DEFAULT_ROOM_AMENITIES onto every room
// that had no amenities, then saved the result. Every such room now has a full amenity array
// that looks identical to the default — it was never chosen by the owner.
// Detection: stored amenities match DEFAULT_ROOM_AMENITIES exactly (by id + available).
//
// publishStatus is intentionally excluded: the publish toggle can emit 'draft' as a real
// user action (un-publishing a room), so we cannot distinguish forced-default from
// intentional 'draft' and must preserve it.
function migrateRoomToV2(r: Room): Room {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = r as any;

  // Clear priceOverride that was auto-created from the old `price` field migration.
  // If the stored JSON still carries the old `price` key and priceOverride matches it
  // exactly, the value was never set by the owner — remove the false override.
  const priceOverride =
    raw.price !== undefined && r.priceOverride === raw.price
      ? undefined
      : r.priceOverride;

  // Clear roomAmenities that are the exact forced default (same ids + available states).
  // Owner-customised amenities differ in at least one member and are preserved.
  const amenityKey = (a: RoomAmenity) => `${a.id}:${a.available}`;
  const defaultSig = new Set(DEFAULT_ROOM_AMENITIES.map(amenityKey));
  const isForcedDefault =
    Array.isArray(r.roomAmenities) &&
    r.roomAmenities.length === DEFAULT_ROOM_AMENITIES.length &&
    r.roomAmenities.every(a => defaultSig.has(amenityKey(a)));
  const roomAmenities = isForcedDefault ? undefined : r.roomAmenities;

  return { ...r, priceOverride, roomAmenities };
}

function migrateToV2(data: BoardingHouse): BoardingHouse {
  return {
    ...data,
    floors: data.floors.map(floor => ({
      ...floor,
      objects: floor.objects.map(obj =>
        obj.kind === 'room' ? migrateRoomToV2(obj) : obj,
      ),
    })),
  };
}

const MIGRATIONS: Record<number, MigrationFn> = {
  2: migrateToV2,
  // 3: migrateToV3,
};

function applyMigrations(data: BoardingHouse): { data: BoardingHouse; migrated: boolean } {
  const from = data.schemaVersion ?? 1;
  if (from >= CURRENT_SCHEMA_VERSION) return { data, migrated: false };

  let result = data;
  for (let v = from + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
    const migrate = MIGRATIONS[v];
    if (migrate) result = migrate(result);
  }
  return { data: { ...result, schemaVersion: CURRENT_SCHEMA_VERSION }, migrated: true };
}

// ─── Per-load normalizers ──────────────────────────────────────────────────────
// Run on every load to fill in fields added to the schema over time.
// Unlike migrations, these are idempotent and always safe to re-run.

// Normalize a single Room: fill in any profile fields added after the data was first saved
function normalizeRoom(r: Room): Room {
  return {
    ...r,
    // publishStatus: NOT defaulted — undefined means "inherit from type".
    publishStatus: r.publishStatus,
    // roomAmenities: NOT defaulted — undefined means "inherit from type".
    roomAmenities: Array.isArray(r.roomAmenities) ? r.roomAmenities : undefined,
  };
}

// Normalize a single RoomType: fill in any fields added after the data was first saved
function normalizeRoomType(t: RoomType): RoomType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = t as any;
  return {
    ...t,
    // Migrate old `basePrice` field name → `price`.
    price:  t.price ?? raw.basePrice,
    photos: Array.isArray(t.photos) ? t.photos : [],
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

    // RoomType normalizer — update whenever RoomType gains a new field
    data.roomTypes = Array.isArray(data.roomTypes)
      ? data.roomTypes.map(normalizeRoomType)
      : [];

    // Property profile normalizer — update whenever BoardingHouse gains a new field
    data.tagline     = data.tagline     ?? '';
    data.description = data.description ?? '';
    data.type        = data.type        ?? 'MIXED';
    data.contact     = data.contact     ?? { whatsapp: '', phone: '', email: '' };
    data.address     = data.address     ?? { full: '' };
    data.amenities   = Array.isArray(data.amenities) ? data.amenities : DEFAULT_AMENITIES;
    data.rules       = Array.isArray(data.rules) ? data.rules : [];
    data.gallery     = data.gallery ?? { categories: DEFAULT_GALLERY_CATEGORIES };

    // Schema migrations — run once per stored dataset, persist result so they don't repeat.
    const { data: migrated, migrated: didMigrate } = applyMigrations(data);
    if (didMigrate) saveToStorage(migrated);

    return migrated;
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
