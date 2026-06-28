# Kosku — Backlog

---

## High Priority

### Dashboard

Occupancy overview for the owner.

Displays total rooms, occupied / available / maintenance counts, and a revenue summary derived from contract history.

Permission: Owner only.
Planned for: v0.4

---

### Floor Management

Ability to add, rename, reorder, and delete floors.

Currently floors are part of the initial data structure and cannot be modified from the UI. Owners need to be able to manage the building layout as the boarding house changes.

Permission: Owner only.
Planned for: v0.5

---

### Public Landing Page

A dedicated landing page on the public route (`/`).

Currently the public route renders the map immediately. A landing page should introduce the boarding house — name, type, gender policy, address, and contact info — before presenting the interactive map.

Permission: Public.
Planned for: v0.5

---

## Medium Priority

### Analytics

Charts and trends derived from contract history.

Includes occupancy rate over time, monthly revenue trend, and average tenant stay duration.

Notes: Depends on Dashboard (v0.4) being complete first. Revenue data is already available via contract storage.

Planned for: v1.0+

---

### Branding

Apply boarding house identity to the UI.

Includes boarding house name, gender type badge, address, and contact phone displayed in the public header. Makes the product feel property-specific rather than generic.

Permission: Owner manages boarding house settings.
Planned for: v0.5

---

### Deployment

Deploy to Vercel and prepare for public access.

Includes production build verification, environment configuration, and adding the live URL to the portfolio. Required before the v1.0 release.

Planned for: v1.0

---

## Low Priority

### Hide Occupied Room Price

On the public map, hide the monthly price for rooms that are currently occupied.

Business rationale: occupied rooms are not available for prospective tenants, so displaying their price creates noise and may expose unintended pricing information.

---

### Developer Utilities

Seed data scripts and localStorage reset tools for faster local development and QA testing.

No user-facing value. Internal tooling only.

---

### Better Facility Icons

Replace current text-based or placeholder facility icons with a consistent icon set (Lucide, HeroIcons, or custom SVG).

Visual improvement only. No business logic changes required.

---

### README Portfolio

A professional `README.md` at the project root for the GitHub repository.

Should include screenshots, feature list, tech stack, architecture summary, and local setup instructions. Required before portfolio submission.

Planned for: v1.0
