# Kosku — Product Roadmap

---

## v0.1 Alpha ✅

Interactive Map

- Visual floor plan with draggable room tiles
- Room status display (available, occupied, maintenance)
- Room detail drawer (view and edit)
- Facility management (add, edit, delete)
- Room CRUD

---

## v0.2 Alpha ✅

Authentication & Permissions

- Login page
- Role system: owner, penjaga, public
- Permission helpers (`canEditRoom`, `canDeleteRoom`, etc.)
- Protected admin route
- Role-based UI visibility
- Usage mode context (public / admin)
- Public route privacy enforcement

---

## v0.3 Alpha ✅

Tenant, Contract & History

- Tenant management (create, edit)
- Contract lifecycle (create, finish)
- Contract business rules (occupied derived from ACTIVE contract, maintenance cannot hold ACTIVE contract)
- Room status driven entirely by contract lifecycle
- Contract history tab with revenue summary
- Permission-gated private data (tenant info, history hidden from public)

---

## v0.4 Alpha 🚧

Dashboard

- Occupancy summary: total rooms, occupied, available, maintenance
- Revenue summary derived from finished contracts
- Recent contract activity
- Owner-only access

---

## v0.5 Beta

Branding · Public Landing · Floor Management

- Boarding house name, type, address, and contact displayed on the public route
- Public landing page before the map
- Floor management: add, rename, reorder, delete floors
- Boarding house settings panel for the owner

---

## v1.0

Production Release

- Deploy to Vercel
- Professional README for GitHub portfolio
- Final responsive polish
- Empty states and loading states review
- End-to-end QA pass
