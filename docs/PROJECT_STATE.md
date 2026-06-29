# Kosku — Project State

**Last updated:** 2026-06-29
**Current branch:** main
**Build status:** Clean (15 routes, no type errors, ET-006.1 complete)

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

---

## Current MVP Status

| Area | Status | Notes |
|---|---|---|
| Interactive map | ✅ Complete | Admin + public, read-only in public |
| Auth & roles | ✅ Complete | owner / penjaga / public |
| Tenant & contracts | ✅ Complete | Full lifecycle |
| Room Types | ✅ Complete | CRUD, inheritance, v2 migration |
| Public experience | ✅ Complete | `/kos` route, all sections |
| Dashboard | 🚧 Stub | Workspace page exists, no content |
| Floor management | ❌ Not started | Floors are static in current UI |
| Gallery | ❌ Not started | `RoomType.photos` reserved but unused |
| Deployment | ❌ Not started | localhost only |

---

## Active Routes

```
/           → Redirects to /kos
/login      → Login page
/admin      → Admin map (protected)
/kos        → Public experience page
/workspace  → Workspace (protected, redirects to /workspace/dashboard)
```

---

## Next Recommended Sprint: ET-007 — Dashboard (or next product sprint)

Build the owner dashboard that surfaced occupancy and revenue data. The underlying data (contracts, tenants, room status) is already complete; this is a pure UI/presentation sprint.

Scope:
- Occupancy summary (total / occupied / available / maintenance)
- Revenue summary from finished contracts
- Recent activity feed
- Owner-only access (`canViewDashboard(role)`)

Estimated effort: Medium (1–2 sessions). Data layer exists; no new storage required.
