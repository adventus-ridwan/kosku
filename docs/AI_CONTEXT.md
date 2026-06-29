# AI Context — Kosku

> This document is for AI sessions. Read it first. Update the "Current status" and "Completed sprints" sections after every sprint.

---

## What this project is

**Kosku** is a single-tenant boarding house management web app. One property owner (or their caretaker) manages one property: rooms, tenants, and contracts. Guests can browse the property at a public URL. There is no backend — everything is stored in localStorage. It is a portfolio project targeting Indonesian boarding house owners.

**Tech stack:** Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS v4. See `AGENTS.md` at the project root before writing any code — this version of Next.js has breaking API changes from your training data.

---

## Product vision and MVP goal

**Vision:** Replace pen-and-paper room tracking with a visual, interactive floor plan. Full docs: `docs/PRODUCT_VISION.md`, `docs/VISION.md`.

**MVP goal:** A single-property tool an owner can open on their phone, use immediately with no sign-up, and share a public link to their boarding house. It must handle: room management, tenant/contract lifecycle, room type catalog, and a polished public experience page.

---

## Core architecture principles

1. **BoardingHouse is the single root entity.** All property data in one localStorage blob (`kos-map-v1`). Tenants and contracts have separate keys.
2. **Room Type First.** `RoomType` owns canonical marketing data (price, amenities, etc.). `Room` holds operational data plus optional overrides. `undefined` on a room field means inherit from its type. Resolution is always via `resolveRoomProfile(room, roomTypes)` in `lib/resolveRoomProfile.ts`.
3. **Migrations run once; normalizers run every load.** Never put one-time cleanup logic in a normalizer. See `lib/storage.ts`.
4. **Privacy is structural, not conditional.** The public route wraps its map in `<UsageModeProvider mode="public">`. Components read `useUsageMode()` to suppress private data — never rely on auth state alone for this.
5. **Permissions via helpers only.** Always use `features/auth/permission.ts`. Never inline `role === 'owner'`.

Full details: `docs/ARCHITECTURE_DECISIONS.md`.

---

## Current project status

**Last updated:** 2026-06-29 | **Build:** Clean (15 routes, 0 lint errors)

| Area | Status |
|---|---|
| Interactive map (admin + public) | ✅ Complete |
| Auth, roles, permissions | ✅ Complete |
| Tenant & contract lifecycle | ✅ Complete |
| Room Types + inheritance + v2 migration | ✅ Complete |
| Public experience page (`/kos`) | ✅ Complete |
| Dashboard | 🚧 Stub — **next sprint (ET-007)** |
| Floor management | ❌ Not started |
| Gallery / photo upload | ❌ Not started |
| Deployment | ❌ Not started |

---

## Completed sprints

| Sprint | What was built |
|---|---|
| v0.1–v0.3 | Map, auth, tenant/contract lifecycle, history |
| Sprint P0.1 | Rebranding: "Kos Map" → "Kosku" |
| ET-005 | Room Type First architecture, price override, v2 migration |
| ET-006 | Public experience page at `/kos` |

Full changelog: `docs/CHANGELOG.md`.

---

## Current technical debt (summary)

| ID | Severity | Issue |
|---|---|---|
| TD-007 | Medium | `/` route still shows raw admin map; should redirect to `/kos` |
| TD-008 | High | Dashboard workspace is a stub |
| TD-001 | Medium | `publishStatus` inheritance gap — old 'draft' values preserved in v2 migration |
| TD-002 | Medium | No explicit "inherit vs override" UI for room fields (Gap 3) |
| TD-006 | Low | Three hooks independently read/write the same localStorage key |

Full list: `docs/TECH_DEBT.md`.

---

## Current priorities

1. **ET-007 — Dashboard** (next sprint): occupancy summary + revenue summary for the owner. Data layer exists; this is a UI sprint. No new storage required.
2. **TD-007**: Redirect `/` to `/kos` for public visitors.

Backlog: `docs/BACKLOG.md`.

---

## Things that must not be redesigned

- `resolveRoomProfile()` — the resolution chain is intentional and tested. Do not modify it without reading `ARCHITECTURE_DECISIONS.md` ADR-005.
- `normalizeRoom` must NOT set `priceOverride` — this was a deliberate regression fix. The v2 migration owns legacy price conversion exclusively.
- `publishStatus` was excluded from the v2 migration intentionally (cannot distinguish auto-set from user-set 'draft').
- localStorage key names (`kos-map-v1`, etc.) — changing these breaks stored data for existing users.
- The `UsageModeContext` privacy pattern — do not remove or bypass it on public routes.

---

## Recommended reading order

For a new session starting development:

1. `AGENTS.md` (root) — mandatory Next.js version notes
2. **This file** — done
3. `docs/ARCHITECTURE_DECISIONS.md` — understand why the code is shaped the way it is
4. `docs/TECH_DEBT.md` — know what is deferred and why
5. `docs/CHANGELOG.md` — what changed recently
6. `docs/DATA_MODEL.md` — type shapes and field semantics
7. Source files for the feature you're about to touch

---

## Instructions for continuing development

- Always check `docs/PROJECT_STATE.md` to confirm what is and isn't built before starting.
- Before editing `lib/storage.ts`, re-read the migration/normalizer separation rules (ADR-006, ADR-007).
- Before editing any public-facing component, verify `UsageModeContext` is being respected.
- Prefer editing existing files to creating new ones.
- After completing a sprint: update **this file** (status table + completed sprints), `docs/CHANGELOG.md`, `docs/PROJECT_STATE.md`, and `docs/TECH_DEBT.md`.
- Run `npm run lint && npm run build` before declaring a sprint complete.
