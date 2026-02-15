---
# rocketbase-p7t6
title: Tighten posts author and fix pages actions overflow
status: completed
type: bug
priority: normal
created_at: 2026-02-15T00:12:04Z
updated_at: 2026-02-15T08:23:31Z
parent: rocketbase-alnr
---

Follow-up table layout tuning for posts/pages admin index views.

## Summary of Changes

Applied the requested follow-up tuning:

- Posts index (app/src/lib/components/admin/posts/data-table.svelte)
  - Narrowed author column to min-w-16 max-w-24 to free space for actions in wider layouts.

- Pages index (app/src/lib/components/admin/pages/data-table.svelte)
  - Narrowed slug column to min-w-10 max-w-14.
  - Tightened actions column to compact trigger width (w/min/max-12) with right padding.

- Pages actions (app/src/lib/components/admin/pages/data-table-actions.svelte)
  - Replaced fragile inline+dropdown behavior with a single compact Popover actions control.
  - Switched to vertical ellipsis trigger (ellipsis-vertical).
  - Popover content now uses direct action buttons (Preview, Edit, Delete/Restore).
  - Added controlled open state so the popover closes when selecting an action.

Validation:
- pnpm check (app) passed with 0 errors and 0 warnings.
