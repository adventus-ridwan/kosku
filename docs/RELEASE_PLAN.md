# Kosku — Release Plan

---

## Alpha

Versions: v0.1 – v0.4

**Goal**

Complete all core product features in a local-only environment.

Alpha is for building and stabilizing. No real users. No deployment. Features may change between alpha versions.

**Alpha is complete when:**

- The interactive map is fully functional
- Room, tenant, and contract lifecycle works end-to-end
- Role-based permissions are enforced at every layer
- The owner dashboard displays occupancy and revenue summaries
- All existing features pass QA with no known regressions

**What Alpha does NOT include:**

- Branding or boarding house identity
- Public landing page
- Floor management UI
- Deployment
- Any backend or database (localStorage only)

---

## Beta

Versions: v0.5

**Goal**

The product looks and feels like a real, property-specific application. It is ready for a limited audience.

Beta transforms a feature-complete tool into a presentable product. Branding is applied, the public experience is improved, and floor management gives owners control over building structure.

**Beta is complete when:**

- The boarding house name, type, and contact info are visible on the public route
- A public landing page introduces the property before the map
- Owners can add, rename, and delete floors
- Boarding house settings are editable from the admin panel
- The UI feels consistent and property-branded throughout

**What Beta does NOT include:**

- Production deployment (prepared in v1.0)
- Backend or database
- Analytics charts (post-v1.0)
- Payment or invoice tracking (post-v1.0)

---

## v1.0

**Goal**

A polished, deployed, portfolio-quality release.

v1.0 is the public milestone. It must be live on Vercel, documented on GitHub, and representative of production engineering standards.

**v1.0 is complete when:**

- The application is deployed and accessible at a public URL
- The GitHub repository has a professional README with screenshots, feature list, tech stack, and setup instructions
- All known QA issues are resolved
- Empty states and loading states are handled throughout
- Responsive layout is verified on mobile and desktop
- The live URL is linked from the developer's portfolio

**v1.0 is NOT:**

- A multi-tenant SaaS
- Backend-powered
- Feature-frozen — future versions may add analytics, payments, and multi-property support
