---
# rocketbase-ok9j
title: Fix page title left gutter and subpage icon
status: completed
type: task
priority: normal
created_at: 2026-02-14T20:44:37Z
updated_at: 2026-02-15T08:34:32Z
parent: rocketbase-iaak
---

Remove unintended left spacing before top-level page titles in admin pages table and replace text-based subpage marker with gray Lucide corner-down-right icon.

## Summary of Changes

- Removed unintended left spacing before top-level page titles in the admin pages table by making prefix rendering conditional.
- Replaced ASCII subpage marker with a gray Lucide `corner-down-right` icon for subpages.
- Added `app/src/lib/components/admin/pages/page-title-cell.svelte` and switched title column rendering in `app/src/lib/utils/admin/pages-columns.ts` to this component.
