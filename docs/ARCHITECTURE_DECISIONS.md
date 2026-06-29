# Kosku — Architecture Decisions

**Last updated:** 2026-06-29

---

## ADR-001: BoardingHouse as Single Root Entity

**Decision:** All application data lives in one `BoardingHouse` JSON blob stored under `kos-map-v1` in localStorage.

**Rationale:** MVP with a single-tenant use case. One root entity simplifies loading, saving, and versioning. No cross-entity joins needed.

**Trade-off:** Multiple hooks (`usePropertyProfile`, `useRoomTypes`, `useRooms`) independently load and save the same key. This is a known minor inefficiency acceptable at MVP scale.

---

## ADR-002: Feature-Based Folder Structure

**Decision:** Code is organized by business domain under `features/`, not by technical layer.

```
features/
  auth/
  property/
  rooms/
  tenants/
  history/
  public/
```

**Rationale:** Keeps related UI, hooks, and types co-located. Each feature can evolve independently.

---

## ADR-003: Permission Helpers — Never Check Roles Directly

**Decision:** All role-based access checks must go through helpers in `features/auth/permission.ts` (e.g., `canEditRoom(role)`), never `role === 'owner'` inline.

**Rationale:** Role names can change; centralized helpers ensure consistent enforcement and a single place to audit access rules.

---

## ADR-004: UsageModeContext for Public vs Admin Routing

**Decision:** A `UsageModeProvider` wraps routes with a `mode` of `'public'` or `'admin'`. Components read this via `useUsageMode()` to suppress editing UI and private data without relying on auth state.

**Rationale:** Auth state persists in localStorage across navigations. A previously-logged-in user navigating to `/kos` would otherwise see tenant data. UsageModeContext is a structural guarantee independent of auth.

**Implementation note:** `effectiveMode` = `usageMode === 'public' ? 'view' : state.mode`. Occupant names: `usageMode === 'public' ? undefined : occupantNames[room.id]`.

---

## ADR-005: Room Type First Architecture (ET-005)

**Decision:** `RoomType` owns canonical marketing data. `Room` holds operational data and optional overrides (`priceOverride?`, `roomAmenities?`, `publishStatus?`). `undefined` means "inherit from type."

**Resolution chain** (in `lib/resolveRoomProfile.ts`):
- Price: `room.priceOverride ?? type?.price`
- Amenities: `room.roomAmenities?.length ? room.roomAmenities : type?.amenities ?? DEFAULT_ROOM_AMENITIES`
- PublishStatus: `room.publishStatus ?? type?.publishStatus ?? 'draft'`

**Rationale:** Most rooms share characteristics (size, amenities, price) with other rooms of the same type. The Room Type is the marketing unit; individual rooms are just instances. This enables room catalog display without enumerating every room.

---

## ADR-006: Migration vs Normalizer Separation

**Decision:** Two distinct mechanisms for evolving stored data:
- **Normalizers** (`normalizeRoom`, `normalizeFloor`, `normalizeRoomType`): run on every `loadFromStorage()`. Idempotent. Fill in new fields with defaults. Safe to re-run.
- **Migrations** (`MIGRATIONS`, `applyMigrations`): run once. Detect and clean up legacy data. Persist `schemaVersion` afterward so the migration never runs again.

**Rationale:** Before this separation, `normalizeRoom` was re-creating `priceOverride` from the legacy `price` field on every load, undoing the migration. Separation ensures one-time cleanup logic lives only in migrations; per-load normalization stays idempotent.

**Rule:** Normalizers must never set fields that a migration is responsible for clearing.

---

## ADR-007: Versioned Schema Migrations

**Decision:** `BoardingHouse.schemaVersion?: number` tracks the schema version of stored data. `applyMigrations()` runs each version's migration function in order, then saves `schemaVersion: CURRENT_SCHEMA_VERSION`.

**Convention for adding a future migration:**
1. Write `function migrateToVN(data: BoardingHouse): BoardingHouse`
2. Add `N: migrateToVN` to `MIGRATIONS`
3. Bump `CURRENT_SCHEMA_VERSION` to N
4. Set `defaultBoardingHouse.schemaVersion = N` so fresh installs skip migration

**Rationale:** Explicit versioning makes it possible to apply transformations in order without re-running already-applied ones. Absent `schemaVersion` in stored data is treated as version 1.

---

## ADR-008: Privacy by Design on Public Route

**Decision:** The public experience at `/kos` never exposes tenant names. This is enforced structurally (not by conditional rendering in each component) via `UsageModeContext`.

**Implementation:** `occupantName={usageMode === 'public' ? undefined : occupantNames[room.id]}` in `GridCanvas.tsx`. The Toolbar is not rendered at all in public mode.

---

## ADR-009: Separate localStorage Keys per Domain

**Decision:** Each storage domain has its own key:
- `kos-map-v1` — BoardingHouse (property, rooms, room types)
- `kos-map-tenants-v1` — Tenants
- `kos-map-contracts-v1` — Contracts
- `kos-map-auth-v1` — Auth session

**Rationale:** Prevents unrelated reads from loading all data. Tenant/contract data never leaks into the public-accessible BoardingHouse blob.
