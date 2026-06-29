# Kosku — Project State

**Last updated:** 2026-06-29
**Current branch:** main
**Build status:** Clean (16 routes, no type errors, ET-007 complete)

---

## Completed Sprints

### v0.1 Alpha — Interactive Map
Interactive floor plan with room/facility CRUD, status display, and room detail drawer.

### v0.2 Alpha — Authentication & Permissions
Login page, role system (owner / penjaga / public), permission helpers, protected admin route, UsageModeContext.

### v0.3 Alpha — Tenant, Contract & History
Tenant management, contract lifecycle (create/finish), occupied status derived from ACTIVE contract, maintenance lifecycle rules, contract history tab with revenue summary, privacy enforcement (tenant data hidden from public).

### Sprint P0.1 — Rebranding
Product renamed from "Kos Map" to "Kosku" across all user-facing surfaces. localStorage keys and source paths unchanged.

### ET-005 — Room Type First Architecture
Room Types introduced as first-class entities owning canonical marketing data (price, description, amenities, size, capacity, publishStatus). Rooms hold operational data plus optional overrides. Resolution chain in `resolveRoomProfile()`. V2 schema migration to remove false overrides left by the old normalizer. Introduced versioned schema migrations with `schemaVersion` on BoardingHouse.

### ET-006 — Public Experience Foundation
`/kos` public route with hero, interactive map (read-only), about section, property amenities, room type cards, and contact section. Privacy enforced: occupant names suppressed on public map. Toolbar hidden in public mode.

### ET-006.1 — Property Identity Polish
Root `/` redirects to `/kos`. Workspace header shows live property name. Sidebar has "Lihat halaman publik" link. PropertyPage has inline preview link. Public hero has "Workspace →" entry point. Resolves TD-007.

### ET-007 — Map Studio + Workspace Refactor
`/workspace/denah` created as Map Studio (primary operational interface). Workspace layout changed from `OwnerRoute` to `ProtectedRoute` — penjaga can now access the workspace. Per-route RBAC via `navConfig.ts` `roles` field and per-page `OwnerRoute` guards on owner-only pages. Sidebar gains collapsible desktop mode (defaults collapsed on denah route). `/admin` redirects to `/workspace/denah`. Post-login destination changed to `/workspace/denah`.

---

## Current MVP Status

| Area | Status | Notes |
|---|---|---|
| Interactive map | ✅ Complete | Admin + public, read-only in public |
| Auth & roles | ✅ Complete | owner / penjaga / public |
| Tenant & contracts | ✅ Complete | Full lifecycle |
| Room Types | ✅ Complete | CRUD, inheritance, v2 migration |
| Public experience | ✅ Complete | `/kos` route, all sections |
| Map Studio (`/workspace/denah`) | ✅ Complete | Map editor in workspace, penjaga access |
| Dashboard | 🚧 Stub | Workspace page exists, no content — ET-010 |
| Floor management | ❌ Not started | Floors are static in current UI |
| Gallery | ❌ Not started | `RoomType.photos` reserved but unused |
| Deployment | ❌ Not started | localhost only |

---

## Active Routes

```
/                      → Redirects to /kos
/login                 → Login page (post-login: /workspace/denah)
/admin                 → Redirects to /workspace/denah
/kos                   → Public experience page
/workspace             → Workspace (any authenticated user, redirects to /workspace/dashboard)
/workspace/denah       → Map Studio (owner + penjaga)
/workspace/dashboard   → Dashboard stub (owner only)
/workspace/property    → Property settings (owner only)
/workspace/room-types  → Room type management (owner only)
/workspace/rooms       → Room list (owner + penjaga)
/workspace/tenants     → Tenant list (owner + penjaga)
/workspace/contracts   → Contract list (owner + penjaga)
/workspace/settings    → Settings (owner only)
```

---

## Architecture Direction (ADR-010)

**Map-first workspace.** The interactive floor plan is the primary operational interface, not the Dashboard. Dashboard is a secondary reporting surface. See `docs/ADR-010-Map-First-Workspace.md`.

---

## Next Sprint: ET-008 — Floor Management

**Goal:** Allow owners to add, rename, and remove floors from within Map Studio.

Currently floors are static — the data model supports multiple floors but the UI has no way to create or rename them. This is a blocker for owners with multi-floor properties.

Scope:
- Add/rename/delete floors via UI within `/workspace/denah`
- Default: single "Lantai 1" floor (already exists for all users)
- Guard: owner-only (floor structure is a property management concern)

---

## Upcoming Sprints (Revised Roadmap)

| Sprint | Goal |
|---|---|
| ~~ET-007~~ | ~~Map Studio — `/workspace/denah`, collapsible sidebar, per-route RBAC~~ — **Done** |
| ET-008 | Floor Management — add/rename/remove floors from Map Studio UI |
| ET-009 | Preview Mode — authenticated owners see `/kos` as guests do, with Quick Edit |
| ET-010 | Dashboard — occupancy + revenue summary, owner-only |
| v1.0   | Deploy, polish |
