# Kosku — AI Session Handoff

**Last updated:** 2026-06-29
**For:** Future AI sessions continuing development on this codebase.

---

## What this project is

Kosku is a single-tenant boarding house management app. One owner manages one property. The public can view the property at `/kos`. The owner and caretaker (penjaga) manage rooms, tenants, and contracts via the admin interface.

All data lives in localStorage (no backend). The app is built with Next.js 16, React 19, TypeScript, Tailwind CSS v4.

**Read `AGENTS.md` at the project root before writing any code.** It includes a critical note about the Next.js version.

---

## Key architectural concepts

### Storage: one root entity

All property data is in one `BoardingHouse` JSON blob at `kos-map-v1`. Tenants and contracts have their own keys (`kos-map-tenants-v1`, `kos-map-contracts-v1`). Auth is at `kos-map-auth-v1`.

### Room Type First Architecture (critical)

`RoomType` owns the canonical marketing profile: price, description, amenities, size, capacity, publishStatus. `Room` holds operational data and optional **overrides** (`priceOverride?`, `roomAmenities?`, `publishStatus?`). `undefined` on the room means "inherit from the assigned type."

Resolution is in `lib/resolveRoomProfile.ts`. Never bypass it — always call `resolveRoomProfile(room, roomTypes)` when displaying room marketing data.

### Migration vs Normalizer (critical)

`lib/storage.ts` has two mechanisms:
- **Normalizers** run on every `loadFromStorage()`. Idempotent. Only fill in new fields.
- **Migrations** run once. Keyed by `schemaVersion`. Persist the result so they never re-run.

**Rule:** Normalizers must not re-create values that a migration is responsible for clearing. The v2 migration cleared false `priceOverride` values; `normalizeRoom` intentionally does NOT touch `priceOverride`.

Adding a migration: write `migrateToVN`, add to `MIGRATIONS`, bump `CURRENT_SCHEMA_VERSION`, update `defaultBoardingHouse.schemaVersion`.

### UsageModeContext (critical for privacy)

`context/UsageModeContext.tsx` provides `'public'` or `'admin'` mode. The `/kos` route wraps its map in `<UsageModeProvider mode="public">`. This is a structural privacy guarantee:
- Occupant names are suppressed in public mode.
- Toolbar is hidden in public mode.
- `effectiveMode` in `BoardingHouseMap/index.tsx` = `usageMode === 'public' ? 'view' : state.mode`.

Do NOT rely on auth state alone to hide private data from public routes.

### Permissions

Always use helpers from `features/auth/permission.ts`. Never check `role === 'owner'` inline.

---

## Current file structure (key paths)

```
app/
  kos/page.tsx             ← Public experience route
  admin/page.tsx           ← Admin workspace (stub)
  login/page.tsx           ← Login
  page.tsx                 ← Root (still shows raw map — see TD-007)

features/
  auth/                    ← Auth hook, permission helpers, storage
  property/                ← Property profile (name, type, address, amenities, etc.)
  rooms/                   ← Room management (useRooms, RoomPanel, RoomsPage)
  tenants/                 ← Tenant + contract management
  history/                 ← Contract history + revenue calculations
  public/                  ← PublicExperiencePage (ET-006)

components/
  BoardingHouseMap/        ← Map container, GridCanvas, RoomDrawer, FacilityDrawer

lib/
  resolveRoomProfile.ts    ← Room Type inheritance resolution chain
  storage.ts               ← loadFromStorage, saveToStorage, migrations, normalizers
  defaults.ts              ← defaultBoardingHouse (starting state for fresh installs)

types/
  index.ts                 ← All core types (BoardingHouse, Room, RoomType, Floor, etc.)

context/
  UsageModeContext.tsx     ← public / admin mode context
```

---

## What was just completed

**ET-005** (Room Type First Architecture) and **ET-006** (Public Experience Foundation) are both complete. Build is clean. Lint passes.

---

## What to do next

**ET-007 — Dashboard** is the recommended next sprint. See `BACKLOG.md` for scope. No new storage needed; all data (contracts, tenants, room status) already exists.

---

## Known technical debt to be aware of

See `TECH_DEBT.md` for the full list. The most impactful items:

- **TD-007** (Medium): `/` still shows the raw admin map instead of redirecting to `/kos`.
- **TD-008** (High): Dashboard workspace is a stub — ET-007 will resolve this.
- **TD-001** (Medium): Rooms that had `publishStatus: 'draft'` before ET-005 may not inherit from their Room Type's publishStatus. Gap 3 (explicit override UI) is the long-term fix.
- **TD-006** (Low): Three hooks independently read/write the same localStorage key. Not a bug at current scale, but a future migration to a shared store would be cleaner.

---

## Things that were deliberately NOT changed

- `resolveRoomProfile()` — do not modify this function without understanding the full resolution chain.
- `publishStatus` in the v2 migration — intentionally excluded. See `lib/storage.ts` for the comment explaining why.
- localStorage key names — changing these would break existing stored data.
- `normalizeRoom` removing `priceOverride` from its logic — this was a deliberate fix. Do not add `priceOverride` back to normalizeRoom.
