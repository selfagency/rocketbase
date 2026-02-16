---
# rocketbase-15d7
title: Add FAQs collection, public page, and admin management
status: in-progress
type: feature
priority: critical
created_at: 2026-02-16T02:03:20Z
updated_at: 2026-02-16T02:11:31Z
---

## Goal
Implement an FAQ feature end-to-end with PocketBase-backed content, a public FAQs page, and an admin interface for managing entries.

## Scope
- PocketBase `faqs` collection schema and migration
- Public `/faqs` page with SEO metadata and accessible accordion/list UI
- Admin FAQs management in `/admin/faqs` (list/create/edit/delete/reorder/publish state)
- Validation, authorization, and tests

## Implementation Plan
- [ ] Define data model for FAQs
  - Fields: `question` (required), `answer` (required), `slug` (optional/derived), `category` (optional), `sort_order` (number), `is_published` (bool), `locale` (optional), timestamps
  - Add indexes for `is_published`, `sort_order`, and optional uniqueness constraints (e.g., slug+locale)
- [ ] Add PocketBase migration and update generated types
  - Create migration in `db/pb_migrations`
  - Regenerate PocketBase TS types consumed by `app`
- [ ] Configure collection API rules
  - Public read: only published FAQ records
  - Admin create/update/delete: restricted to admin role
- [ ] Implement server-side FAQ data access in app
  - Add server helper/query functions for listing published FAQs and admin filtered lists
  - Enforce sort ordering and stable fallback ordering
- [ ] Build public FAQs route
  - Add `app/src/routes/faqs/+page.server.ts` and `+page.svelte`
  - Accessible structure: semantic headings, keyboard-friendly expand/collapse, proper ARIA labels
  - Handle empty state and graceful errors
- [ ] Build admin FAQs management
  - Add route(s) under `app/src/routes/admin/faqs`
  - CRUD actions with validation (Zod/superforms), optimistic UX where appropriate
  - Reorder support via `sort_order` (up/down controls initially; drag-drop optional follow-up)
- [ ] Add navigation and metadata integration
  - Link public FAQs from main navigation/footer as appropriate
  - Configure page title/description and Open Graph metadata
- [ ] Add tests
  - Unit tests: schema validation and server helpers
  - Route/action tests: public filtering and admin authorization
  - E2E tests: public page rendering and admin CRUD happy path
- [ ] Quality checks
  - Run lint, type checks, and tests in `app` and relevant `db` checks
  - Verify no secrets/config regressions

## Acceptance Criteria
- Public users can view only published FAQs on `/faqs` sorted by `sort_order` then creation time
- Admin users can create, edit, delete, and reorder FAQs in `/admin/faqs`
- Non-admin users cannot access admin FAQ mutations
- FAQ feature is covered by tests and passes workspace quality gates

## Notes
- Build with accessibility in mind (WCAG 2.2 AA), then manually verify with tooling such as Accessibility Insights.
