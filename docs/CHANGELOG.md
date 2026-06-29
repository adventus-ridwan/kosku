# Changelog

## ET-006.1 — Property Identity Polish

### Changed

- **Root route redirect**: `/` now redirects to `/kos`. Public visitors always land on the public experience page. Owners navigate to `/workspace` or `/login` directly.
- **Workspace header — live property name**: The workspace header property switcher now displays the actual `boardingHouse.name` from storage instead of the hardcoded placeholder "Kos Melati". Falls back to "Properti" while loading.
- **Workspace sidebar — "Lihat halaman publik" link**: A secondary link at the bottom of the workspace sidebar opens `/kos` in a new tab. Visually separated from the main nav by a divider.
- **Property workspace page — preview link**: The `Properti` page subtitle now includes a "Lihat tampilan publik →" link that opens `/kos` in a new tab. Directly connects the editing surface to the public projection.
- **Public page hero — "Workspace →" entry point**: A minimal right-aligned "Workspace →" text link at the top of the hero section links to `/workspace`. Unauthenticated visitors are redirected to `/login` by the auth guard. The link is discoverable but does not compete with the primary tenant-facing CTAs.

### Resolved tech debt

- TD-007: Root `/` route no longer shows the raw admin map.

---

## ET-006 — Public Experience Foundation

### Added

- `/kos` public route — full public experience page for boarding house guests.
- `features/public/PublicExperiencePage.tsx` — single-file page with all sections:
  - **HeroSection**: property name, tagline, type badge, address, WhatsApp CTA and map anchor.
  - **MapSection**: read-only interactive floor plan wrapped in `UsageModeProvider mode="public"`.
  - **AboutSection**: conditional on property description.
  - **AmenitiesSection**: grid of available property-level amenities.
  - **RoomTypesSection**: published Room Types only, sorted by `sortOrder`, with price, size, capacity, available amenity chips, and per-type WhatsApp link.
  - **ContactSection**: dark footer with WhatsApp button, phone link, and address.
- WhatsApp URL normalization: `08xxx → 628xxx`, URL-encoded greeting message.
- Privacy enforcement: occupant names suppressed in public map (`usageMode === 'public' ? undefined : occupantNames[room.id]`).
- Admin Toolbar hidden in public mode.

---

## ET-005 — Room Type First Architecture

### Added

- `RoomType` entity: canonical marketing data (name, price, description, size, capacity, amenities, publishStatus, sortOrder, photos).
- `resolveRoomProfile()` (`lib/resolveRoomProfile.ts`): resolution chain for price, amenities, publishStatus. `undefined` on room = inherit from type.
- `priceOverride?: number` on `Room` type: explicit price exception without touching Room Type.
- `schemaVersion?: number` on `BoardingHouse`: enables versioned one-time migrations.
- Schema migration infrastructure in `lib/storage.ts`: `applyMigrations()`, `MIGRATIONS`, `CURRENT_SCHEMA_VERSION = 2`.
- **V2 migration** (`migrateToV2`): removes false price and amenity overrides introduced by the v1 normalizer.
  - Price: clears `priceOverride` if it matches the old `price` field exactly (auto-created, not user-set).
  - Amenities: clears `roomAmenities` if it exactly matches `DEFAULT_ROOM_AMENITIES` (forced default, not user-set).
  - `publishStatus` intentionally excluded (cannot distinguish forced default from intentional user action).
- `defaultBoardingHouse.schemaVersion = 2`: fresh installs start at v2, skip migration.
- Price override input in `RoomPanel.tsx` and `RoomDrawer.tsx`: "Dari tipe" badge when inheriting.
- `RoomListItem` in `RoomsPage.tsx` uses `resolveRoomProfile` for displayed price and publishStatus.

### Fixed

- Normalizer-migration conflict: `normalizeRoom` no longer re-creates `priceOverride` from the legacy `price` field. Migrations exclusively own one-time data conversion; normalizers only fill in new schema fields.

---

## Sprint P0.1 — Project Rebranding

### Changed

- Product name updated from "Kos Map" to "Kosku" across all user-facing surfaces and documentation.
- Browser tab title, login page heading and subtitle updated.
- `app/layout.tsx` metadata description updated.
- All `/docs` files updated.

### Preserved

- `package.json` name unchanged (`kos-map`).
- localStorage keys unchanged (`kos-map-v1`, `kos-map-auth-v1`, `kos-map-tenants-v1`, `kos-map-contracts-v1`).
- All import paths and source folder names unchanged.

---

## v0.4 — Authentication

### Added

- Authentication
- Login Page
- Role System (owner, penjaga, public)
- Auth Context
- Protected Route
- Permission helpers

### Changed

- Admin route is now protected.

### Fixed

- LocalStorage SSR handling.

---

## Sprint 3C.1 — Privacy Regression Fix

### Fixed

- History tab (and Tenant tab) no longer visible to previously-authenticated users on the public route.
- Root cause: `RoomDrawer` read `role` directly from `useAuth()` (localStorage), which persists across route navigations.
- Fix: `RoomDrawer` calls `useUsageMode()` and derives `effectiveRole = usageMode === 'public' ? null : role`. All permission checks use `effectiveRole`.

---

## Sprint 3C — Contract History

### Added

- `features/history/historyUtils.ts` — pure calculation functions: duration, revenue, summary builder.
- `features/history/HistoryTab.tsx` — summary cards (total contracts, lifetime revenue, average stay) + sorted contract list.
- `canViewContractHistory` permission helper (penjaga + owner).
- History tab in Room Drawer, gated by `canViewContractHistory`.

### Business Rules

- History derived from Contract storage — no new storage.
- Revenue formula: `monthlyRent × (durationDays / 30)`.

---

## Sprint 3B.1 — Contract Business Rules

### Added

- Occupied → Maintenance transition: finishes the ACTIVE contract with today's date.
- "Pindah ke Perbaikan" button in status field when room is occupied.

### Changed

- `contractStorage.finishContract` accepts optional `endDate`.
- `useTenant.finishContract` threads `endDate` through.
- `RoomDrawer.handleSave` detects occupied → maintenance and calls finish-contract before saving.

---

## Sprint 3B — Contract Lifecycle

### Added

- Finish Contract action inside Tenant tab (penjaga + owner).
- Inline confirmation dialog before finishing.
- `finishContract` in `contractStorage.ts`.
- `canFinishContract` permission helper.
- `onRoomVacant` callback on `TenantTab`.

### Changed

- Room status → `available` immediately after contract is finished.

---

## Sprint 3A.1 — Stabilization

### Fixed

- Tenant information derives from ACTIVE Contract.
- Public users cannot view tenant information.
- Maintenance rooms cannot create active contracts.
- Fixed width/height numeric input behavior.
- Verified facility deletion.
