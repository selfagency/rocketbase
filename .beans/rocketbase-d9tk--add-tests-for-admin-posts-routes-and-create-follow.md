---
# rocketbase-d9tk
title: Add tests for admin posts routes and create follow-up beans
status: completed
type: task
priority: normal
created_at: 2026-02-14T21:08:52Z
updated_at: 2026-02-14T21:13:49Z
---

Add e2e coverage for admin posts index/new/edit routes and ensure posts submenu link visibility, then create follow-up beans for trash workflow, soft-delete, cleanup cron, and newsletters collection.

## Summary of Changes

- Confirmed the admin submenu already includes a Posts link in .
- Added E2E coverage for admin posts routes in  (index, new, edit, and edit-save flow).
- Updated  to assert  accessibility from the admin navigation context.
- Created follow-up beans for trash view, soft-delete behavior, 30-day trash cleanup cron, and newsletters collection:
  - rocketbase-qxuk
  - rocketbase-pl1s
  - rocketbase-spwq
  - rocketbase-3h5i

Validation performed:
- Targeted diagnostics on modified test files: no errors.
- Focused E2E run for updated/new tests: passing.

## Corrections

File references from the previous summary were stripped by shell interpolation. Correct references:
- app/src/lib/components/global/Nav.svelte
- app/src/tests/e2e/admin-posts.test.ts
- app/src/tests/e2e/nav.test.ts
- Route verified: /admin/posts
