# Kos Map - Architecture

## Architecture Style

Feature-Based Architecture

Each business domain owns its own files.

Example

features/

* auth
* rooms
* facilities
* tenants
* dashboard

---

# Layer Responsibilities

UI

Responsible only for presentation.

Should not contain business logic.

---

Hooks

Reusable application logic.

---

Storage

Responsible for LocalStorage access.

No UI code.

---

Types

Contains TypeScript interfaces and enums.

---

Business Logic

Reusable helper functions.

Independent from UI.

---

# Folder Structure

src/

components/

features/

hooks/

types/

utils/

lib/

---

# Development Principles

* Incremental changes only.
* Avoid rewriting existing code.
* Keep components small.
* Keep files focused on one responsibility.
* Prefer reusable helpers.
* Avoid duplicated business logic.

---

# Permission

Authorization must always use permission helpers.

Never check roles directly across multiple components.

Good

canEditRoom(role)

Bad

role === "owner"

---

# Storage

Every business domain owns its own storage.

Example

features/

tenants/

tenantStorage.ts

contractStorage.ts

Room storage should never contain tenant data directly.

Contract is the source of truth.

---

# Future Backend

Current implementation uses LocalStorage.

The architecture should allow future migration to:

* Supabase
* Firebase
* PostgreSQL

without changing UI components.
