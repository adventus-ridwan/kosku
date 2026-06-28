# Kosku - Project Rules

## Vision

Kosku adalah aplikasi manajemen kos berbasis denah interaktif.

Target utama project ini adalah membangun portfolio SaaS yang profesional, bukan aplikasi enterprise.

---

# Development Principles

- Incremental changes only.
- Do not rewrite existing features unless absolutely necessary.
- Existing functionality must continue to work.
- Prioritize readability over clever code.
- Keep components small and reusable.
- Prefer composition over duplication.

---

# Architecture

- Feature-based structure.
- TypeScript first.
- Reusable hooks.
- Permission helper for authorization.
- LocalStorage until backend is introduced.

---

# Coding Rules

- No duplicated business logic.
- No hardcoded role checking across multiple files.
- Keep functions focused on one responsibility.
- Prefer custom hooks over repeated code.
- Maintain clean folder structure.

---

# Quality Checklist

Every sprint should:

- Build successfully.
- Pass TypeScript checks.
- Preserve existing features.
- Be easy to extend.
- Follow project architecture.

---

# Long-term Goal

Kosku should feel like a real SaaS product suitable for showcasing in a professional portfolio.