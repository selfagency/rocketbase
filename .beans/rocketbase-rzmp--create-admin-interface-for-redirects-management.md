---
# rocketbase-rzmp
title: Create admin interface for redirects management
status: todo
type: feature
priority: normal
created_at: 2026-02-14T02:15:00Z
updated_at: 2026-02-15T08:06:34Z
parent: rocketbase-3s0i
---

Create an admin interface for managing URL redirects. This should be accessible only to admins and added to the admin dropdown menu.

## Requirements

- Admin-only access (check user role)
- CRUD operations for redirects:
  - List all redirects with search/filter
  - Create new redirect (slug + URL)
  - Edit existing redirect
  - Delete redirect
  - Bulk delete option
- Add to Admin dropdown menu
- Validation:
  - Slug format validation (URL-safe)
  - URL validation (valid absolute URL)
  - Duplicate slug prevention
- Table/list view with sortable columns
- Responsive design (mobile-friendly)

## Implementation

- Create route: `app/src/routes/admin/redirects/+page.svelte`
- Create route: `app/src/routes/admin/redirects/+page.server.ts`
- Create route: `app/src/routes/admin/redirects/new/+page.svelte`
- Create route: `app/src/routes/admin/redirects/[id]/+page.svelte`
- Update admin nav component to include Redirects link
- Use existing shadcn-svelte components (Table, Form, Dialog, etc.)

## Related

- Redirects collection already exists in PocketBase
- Backend redirect handling already implemented (rocketbase-n4yt)
- Collection rules: createRule/updateRule/deleteRule require admin role
