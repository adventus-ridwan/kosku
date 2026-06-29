# ADR-010: Map-First Workspace Architecture

**Date:** 2026-06-29
**Status:** Accepted
**Sprint:** Pre-ET-007 (Architecture Finalization)

---

## Context

Through ET-005 and ET-006, the workspace accumulated a conventional admin structure: Dashboard → Rooms → Room Types → Tenants → Contracts. The map existed as its own route (`/admin`) outside the workspace entirely. The public experience was a separate surface (`/kos`) with no bridge to the operational tools.

Two problems emerged from this structure:

1. **The map was stranded.** The most powerful capability in Kosku — the interactive floor plan — was reachable only via `/admin`, a route disconnected from the workspace layout and inaccessible to penjaga via the workspace. Owners had to leave the workspace to do spatial work.

2. **Dashboard was the wrong home.** A dashboard shows summaries of data that has already been entered. For a new user setting up a property, a dashboard is empty and meaningless. For an experienced user managing a kos, the first question is almost always spatial: which room is available, who is in which room, which room needs attention. A table or summary cannot answer this as quickly as a floor plan.

An architecture review before ET-007 identified a more coherent product identity: **the interactive map is the operational center of Kosku**, not a supporting view.

---

## Decision

The workspace is reorganized around the map as the primary operational surface.

### Surface model

| Surface | Route | Purpose |
|---|---|---|
| Map Studio | `/workspace/denah` | Primary operational interface. Spatial overview, room status, direct interaction with individual rooms. |
| List Management | `/workspace/rooms`, `/workspace/tenants`, `/workspace/contracts` | Supporting workflows. Bulk operations, search, filtering — tasks that are faster in a list than on a map. |
| Dashboard | `/workspace/dashboard` | Summary and reporting. Occupancy rate, revenue, activity feed. Secondary surface; opens on data you've already entered. |
| Property Setup | `/workspace/property`, `/workspace/room-types`, `/workspace/settings` | Configuration layer. Not part of the daily workflow; accessed infrequently. |
| Public Experience | `/kos` | Guest-facing page. Read-only view of the property. |

### Post-login destination

After login, users land on `/workspace/denah` (Map Studio), not `/workspace/dashboard`. This is the most useful first screen for both owners and penjaga: it immediately shows the state of every room.

### Workspace layout

The workspace uses a single consistent layout (sidebar + header) across all routes. The sidebar is collapsible: expanded (224px with labels) for list-based pages, collapsed (48px icon-strip) by default on `/workspace/denah` to maximize map canvas space. Users can toggle manually; the preference persists for the session.

### Permission model

The workspace layout uses `ProtectedRoute` (any authenticated user), not `OwnerRoute` (owner only). Per-route RBAC is enforced via `navConfig.ts` `roles` field (already defined, previously unused) and per-page access guards. This allows penjaga to access operational routes (denah, rooms, tenants, contracts) while keeping configuration routes (property, room types, settings, dashboard) owner-only.

### `/admin` route

`/admin` is deprecated as a standalone operational route. It redirects to `/workspace/denah`. The `BoardingHouseMap` component itself is unchanged — it moves into the workspace layout without modification.

---

## Rationale

### Why the map is the operational center

Boarding house owners and caretakers think spatially. The question "which room is available?" is answered by looking at the floor plan, not reading a list. Every room action — checking in a tenant, noting maintenance, adjusting a price — begins with locating a room, which the map makes immediate.

List-based management is better for a different class of task: "show me all rooms unpublished from any floor" or "list all contracts expiring this month." These are sweep queries across the dataset. The map cannot answer them well. The list tools exist for exactly these tasks — but they are the exception, not the default workflow.

### Why Dashboard is no longer the home

A dashboard reports on prior work. It is useful — but it is not where work is done. Routing every login through a dashboard means owners and penjaga navigate past a summary to reach the tool they came for. This adds friction to the daily workflow for the benefit of a secondary surface.

Moving the login destination to `/workspace/denah` matches intent: users log in to manage the property, and managing the property starts with the map.

Dashboard remains important as a reporting surface. It is not removed; it is repositioned.

### Why Workspace and Public Experience are separated

`/kos` (public) and `/workspace` (operational) serve different audiences with different access levels and privacy requirements. The public page is for guests; the workspace is for the owner and penjaga.

Structural separation (separate routes, separate `UsageModeContext`) is already established by ADR-004 and ADR-008. This decision reaffirms and strengthens that separation: the workspace makes no attempt to look like the public page, and the public page makes no attempt to surface workspace UI.

The only intentional bridge is Preview Mode (planned for ET-009): authenticated users visiting `/kos` see the public page as guests do, but with a lightweight Quick Edit capability for non-structural room properties. This bridge is explicitly gated and opt-in.

### Why Preview Mode exists

Preview Mode solves a real workflow gap: owners want to know what their guests see. Today, they must switch browser contexts or open a private window. Preview Mode eliminates this friction by letting authenticated users see `/kos` exactly as guests do, with a small Quick Edit overlay for minor adjustments.

Preview Mode is distinct from the workspace. It does not grant structural editing (adding rooms, changing layouts, managing contracts). It is a read-and-lightweight-edit layer on top of the public view.

This maintains the product separation: the public experience is still a guest surface, and the workspace is still the complete management tool.

### Why list-based management is supporting, not primary

List tools (`/workspace/rooms`, `/workspace/tenants`, `/workspace/contracts`) are not deprecated or demoted in importance — they are repositioned as the right tool for bulk and sweep operations, not the entry point.

The key insight: most daily interactions with a kos are about a specific room or a specific tenant, not the full dataset. The map handles specific-room interactions better than a list. The list handles dataset-level queries better than the map. Neither replaces the other; the question is which one should be the default entry point.

The map wins the entry-point question because it immediately communicates state across the whole property without requiring the user to form a query.

---

## Alternatives Considered

### Keep Dashboard as the workspace home, add map as a tab

**Rejected.** Treating the map as a tab inside a dashboard treats it as a detail view inside a summary view. The map is not a summary — it is the operational surface. This framing would have trained users to reach for the dashboard first, then navigate to the map when they wanted to act.

### Move map to a dedicated route outside the workspace (`/admin` preserved)

**Rejected.** This was the status quo. The map was isolated from the workspace layout, required a separate navigation pattern, and was inaccessible to penjaga via the workspace. Two separate applications with disconnected navigation is worse than one workspace with a collapsible sidebar.

### Separate workspace layout for the map (no sidebar)

**Rejected.** Creating a visually distinct layout for `/workspace/denah` would fragment the workspace identity. Users would feel they had left the workspace when navigating to the map. The collapsible sidebar retains navigation context (icons always visible) while giving the map maximum canvas space.

### Make Preview Mode a workspace sub-view (not a mode on `/kos`)

**Rejected.** Preview Mode's purpose is to show the owner what guests see. If it lives inside the workspace, the owner sees the workspace's chrome (sidebar, header, workspace design language) around a guest-facing preview. This defeats the purpose. Preview Mode must live on `/kos` — the same URL, the same layout guests see — with a lightweight overlay.

---

## Consequences

### Immediate changes (ET-007 scope)

- `app/workspace/layout.tsx`: `OwnerRoute` → `ProtectedRoute`
- `features/workspace/navConfig.ts`: `roles` field populated; "Denah" added as first nav item
- `components/WorkspaceLayout/Sidebar.tsx`: collapsible sidebar state; filters nav by role
- `app/workspace/denah/page.tsx`: created; wraps `BoardingHouseMap` with `mode="admin"`
- `app/admin/page.tsx`: redirects to `/workspace/denah`
- `app/login/page.tsx`: post-login redirect changes from `/admin` to `/workspace/denah`
- Per-page `AccessGuard` on owner-only workspace pages

### Future changes (ET-009 and beyond)

- `types/index.ts`: `UsageMode` gains `'preview'` variant
- `RoomDrawer.tsx`: `effectiveRole` split; `canQuickEdit` gate added
- `PublicExperiencePage.tsx`: auth-aware mode; `PreviewIndicator` pill
- Floor management (planned before v1.0): adds/renames/removes floors from within Map Studio

### Invariants preserved

- `BoardingHouseMap` component is unchanged. It receives a `UsageModeContext` from its parent and has no awareness of which route it lives on.
- ADR-004 (`UsageModeContext`) and ADR-008 (privacy by design) are unaffected. Mode is still set structurally by the route.
- `resolveRoomProfile()`, storage keys, and migration logic are all unchanged.
