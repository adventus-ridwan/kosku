# Kosku — Product Vision

---

## Vision

Kosku is an interactive boarding house management application built around a visual floor plan.

Instead of managing rooms from a data table, the owner and manager interact with the boarding house directly through a map. Every action — viewing a room, managing a tenant, reading contract history — starts from a click on the map.

The map is the product.

---

## Target Users

**Owner**

The boarding house owner. Has full access to all features including financial data, room management, tenant management, and boarding house settings. The primary beneficiary of the product.

**Penjaga (Manager)**

The on-site manager responsible for daily operations. Can manage rooms, tenants, and contracts but cannot access financial summaries or settings. Represents the most common daily user.

**Public (Prospective Tenant)**

A visitor browsing available rooms. Sees the interactive map and room details but no private tenant information, pricing for occupied rooms, or management controls.

---

## Core Values

**Map First**

Every workflow begins from the map. Navigation should feel spatial, not form-driven.

**Simple Over Complete**

Version 1 solves the real problems of a small boarding house. It does not try to be an enterprise system.

**Privacy by Design**

Private data (tenant names, contact info, contract details, revenue) is never exposed to public users. Role-based access is enforced at every layer.

**Clean Architecture**

The codebase is structured to be readable, maintainable, and extensible. Business logic lives in domain modules, not in UI components.

**Portfolio Quality**

Every feature should be implemented with the same care expected of a production SaaS product. This project is a professional demonstration of engineering judgment.

---

## Primary Problems Solved

**Problem 1 — No spatial context in traditional management tools**

Most boarding house software uses tables and forms. Owners and managers lose the mental model of the physical space. Kosku keeps the floor plan at the center of every interaction.

**Problem 2 — Tenant and contract data scattered or informal**

Small boarding houses often manage tenant information in spreadsheets or messaging apps. Kosku provides a structured contract lifecycle: create, active, finish — with a permanent history record.

**Problem 3 — No role separation**

Owners often share full-access tools with staff. Kosku enforces a two-role system: the owner sees financial data; the penjaga sees only operational data.

**Problem 4 — No public-facing information**

Prospective tenants have no self-service way to check availability. The public route gives them a read-only view of the map and room details without exposing private information.

---

## Long-term Goals

The following are outside Version 1 scope but represent the intended product direction.

- Payment tracking and invoice generation
- Online booking and availability calendar
- Multi-property support (one account, multiple boarding houses)
- Mobile application
- Analytics and occupancy trend charts
- Backend migration (Supabase or PostgreSQL) without changing UI components

These features are intentionally deferred. Version 1 establishes the architecture and user experience foundation that makes these additions straightforward.
