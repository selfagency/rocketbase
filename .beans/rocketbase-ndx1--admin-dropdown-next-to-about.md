---
# rocketbase-ndx1
title: Admin dropdown next to About
status: completed
type: task
priority: normal
created_at: 2026-02-13T22:56:00Z
updated_at: 2026-02-14T20:22:01Z
---

Title: Admin dropdown next to About
Type: task
Status: completed
Priority: normal

Description:
Add an "Admin" dropdown menu next to the About/main nav items (not under the user/account dropdown). The Admin dropdown should be visible only to logged-in users with roles: admin, editor, or contributor. Inside the Admin dropdown show:

- Dashboard (all 3 roles) -> /admin
- Pages (admins & editors only) -> /admin/pages

Acceptance criteria:

- Admin dropdown is in the primary navigation (next to About)
- Dropdown only appears for logged-in users with the required roles
- Pages link appears only for admins and editors
- Dropdown is keyboard accessible and follows existing nav menu patterns

Caveats:

- Do not move or remove the existing Account dropdown
- Update nav component and add tests if possible

## Summary of Changes

Implemented Admin dropdown in `app/src/lib/components/global/Nav.svelte`:

- Admin dropdown placed in primary navigation (next to main items)
- Visible only to roles admin|editor|contributor
- Pages link shown only to admin and editor

Navigation component updated and manual verification steps added to the bean.
