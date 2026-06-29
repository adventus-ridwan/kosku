# Kosku — Technical Debt

**Last updated:** 2026-06-29

Severity scale: **High** (blocks a feature or causes user-visible bugs) / **Medium** (workaround exists, degrades maintainability) / **Low** (cosmetic or future concern)

---

## TD-001: publishStatus Inheritance Gap — Medium

**Location:** `lib/storage.ts` (v2 migration), `lib/resolveRoomProfile.ts`

**Problem:** The old v1 normalizer set `publishStatus: 'draft'` on every room before room types existed. The v2 migration intentionally did NOT clear these values because the publish toggle also emits `'draft'` as a real user action. As a result, rooms that were auto-assigned `'draft'` before room types existed will not inherit `publishStatus` from their assigned Room Type.

**Impact:** Rooms assigned to a published Room Type may still show as unpublished if they were created before ET-005.

**Deferred because:** We cannot distinguish `publishStatus: 'draft'` set by the old normalizer from one set by the owner deliberately un-publishing a room.

**Resolution path:** Gap 3 — introduce an explicit "Inherit / Override" toggle per field. When a room has `publishStatusMode: 'inherit'`, clear the room-level value regardless. See TD-003.

---

## TD-002: No Explicit Override UI (Gap 3) — Medium

**Location:** `features/rooms/RoomPanel.tsx`, `components/BoardingHouseMap/RoomDrawer.tsx`

**Problem:** Price and amenity overrides are implicitly managed: empty price = inherit, non-empty = override. There is no "Reset to type default" action. Users cannot tell if a field is currently overriding or inheriting without inspecting.

**Impact:** Power users managing mixed-type rooms with partial overrides may find the UI confusing.

**Deferred because:** Adds UI complexity; MVP scope only needs the inheritance to work correctly, not be visually explicit.

**Resolution path:** Add per-field "Inherit from Room Type / Use Custom Value" toggle (radio or inline toggle). Requires `priceOverrideMode?: 'inherit' | 'custom'` on Room, plus a "Reset" button.

---

## TD-003: RoomType.photos Always Empty — Low

**Location:** `types/index.ts`, `lib/storage.ts` (`normalizeRoomType`)

**Problem:** `RoomType.photos: RoomTypePhoto[]` is always `[]`. The `RoomTypePhoto` type is defined and normalized, but no UI for uploading or managing room type photos exists.

**Deferred because:** Gallery sprint is deferred past MVP.

---

## TD-004: RoomType.amenitiesMode Reserved — Low

**Location:** `types/index.ts`

**Problem:** `RoomType.amenitiesMode?` field exists in the type definition but is not read anywhere.

**Deferred because:** Intended for a future "amenities mode" feature (merge vs replace room-level amenities).

---

## TD-005: GalleryCategory.imageCount Is a Placeholder — Low

**Location:** `features/property/types.ts`

**Problem:** `GalleryCategory.imageCount` is defined but always 0. It was intended to become a derived value once real image upload is implemented.

**Deferred because:** Gallery sprint deferred.

---

## TD-006: Multiple Hooks Loading Same localStorage Key — Low

**Location:** `features/property/usePropertyProfile.ts`, `features/rooms/useRooms.ts`, `features/roomTypes/useRoomTypes.ts`

**Problem:** Each hook independently calls `loadFromStorage()`, which reads and parses the full `kos-map-v1` blob. Three hooks = three parses per page load. Saves are also independent, so a race condition between two simultaneous saves (e.g., `useRooms` and `useRoomTypes` both updating within a single render cycle) could cause one to overwrite the other.

**Impact:** Performance is negligible at current data sizes. Race condition is theoretical with current usage patterns.

**Resolution path:** Centralize storage in a single React context or Zustand store. All mutations go through one save function.

---

## TD-007: `/` Route Still Shows Raw Admin Map — Medium

**Location:** `app/page.tsx`

**Problem:** The root route renders the raw boarding house map. Now that `/kos` exists as the public experience, `/` should redirect to `/kos` for public users (or remain as an admin-only entry point with a redirect).

**Impact:** Public visitors who land on `/` see the admin map, not the polished public experience.

**Resolution path:** Redirect `/` → `/kos`, or add a proper landing/splash page at `/`.

---

## TD-008: Dashboard Workspace Is a Stub — High

**Location:** `app/admin/page.tsx` (or equivalent workspace page)

**Problem:** The admin workspace exists as a route but renders no meaningful content. Occupancy and revenue data (from contracts/tenants) are not yet surfaced.

**Planned for:** ET-007 (next sprint).

---

## TD-009: RoomType.rules Reserved — Low

**Location:** `types/index.ts`

**Problem:** `RoomType.rules?: PropertyRule[]` is defined but never populated or displayed.

**Deferred because:** Room-level rules were considered out of scope for the MVP room type feature.
