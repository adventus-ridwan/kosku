# Changelog

## v0.4

### Added

- Authentication
- Login Page
- Role System
- Auth Context
- Protected Route
- Permission Helper

### Changed

- Admin route is now protected.

### Fixed

- LocalStorage SSR handling.

## Sprint 3C.1 - Privacy Regression Fix

### Fixed

- History tab (and Tenant tab) no longer visible to previously-authenticated users on the public route (`/`).
- Root cause: `RoomDrawer` was reading `role` directly from `useAuth()` (localStorage), which persists across route navigations. On the public route the role was not nulled out, so `canViewContractHistory` / `canViewTenantInfo` returned `true` for any user who had previously logged in.
- Fix: `RoomDrawer` now calls `useUsageMode()` and derives `effectiveRole = usageMode === 'public' ? null : role`. All permission checks (`canViewTenantInfo`, `canViewContractHistory`, `canEditRoom`, `canDeleteRoom`) use `effectiveRole`. This matches the existing `effectiveMode` pattern in `BoardingHouseMap/index.tsx`.

---

## Sprint 3C - Contract History

### Added

- `features/history/historyUtils.ts` — pure calculation functions: `calculateDurationDays`, `formatDuration`, `calculateContractRevenue`, `buildHistoryEntries`, `buildHistorySummary`.
- `features/history/HistoryTab.tsx` — History tab UI: summary cards (total contracts, lifetime revenue, average stay) + contract list sorted newest-first.
- `canViewContractHistory` permission helper (penjaga + owner).
- History tab in Room Drawer (gated by `canViewContractHistory`).

### Business Rules

- History is derived directly from Contract storage — no new storage introduced.
- Summary includes all contracts (ACTIVE, FINISHED, CANCELLED).
- Revenue formula: `monthlyRent × (durationDays / 30)` per DATA_MODEL.
- History updates automatically when the user switches to the tab (fresh mount on each tab switch).

---

## Sprint 3B.1 - Contract Business Rules

### Added

- Room Status Lifecycle rules documented in `DATA_MODEL.md`.
- Occupied → Maintenance transition: automatically finishes the ACTIVE contract with today's date as the actual end date.
- "Pindah ke Perbaikan" button shown in the status field when a room is occupied.

### Changed

- `contractStorage.finishContract` now accepts an optional `endDate` parameter to record the actual termination date.
- `useTenant.finishContract` threads the optional `endDate` through to storage.
- `RoomDrawer.handleSave` detects the occupied → maintenance transition and calls the shared finish-contract logic before saving.

### Preserved

- FINISHED contracts always remain in storage.
- Occupied cannot be manually selected (Rule 1 unchanged).
- Maintenance → Available returns the room to available, never occupied.

---

## Sprint 3B - Contract Lifecycle

### Added

- Finish Contract action inside Tenant tab (edit mode, penjaga + owner only).
- Inline confirmation dialog before finishing a contract.
- `finishContract` storage function in `contractStorage.ts`.
- `canFinishContract` permission helper in `permission.ts`.
- `finishContract` method exposed from `useTenant` hook.
- `onRoomVacant` callback on `TenantTab` component.

### Changed

- Room status updates to `available` immediately after a contract is finished.
- `RoomDrawer` passes `handleRoomVacant` to `TenantTab`.

### Preserved

- FINISHED contracts remain in storage — never deleted.
- Tenant records are never deleted automatically.
- A new tenant can be added to the room immediately after finishing a contract.

---

## Sprint 3A.1 - Stabilization

### Fixed

- Tenant information now derives from ACTIVE Contract.
- Public users can no longer view tenant information.
- Maintenance rooms cannot create active contracts.
- Fixed width/height numeric input behavior.
- Verified facility deletion.
- Regression testing completed successfully.