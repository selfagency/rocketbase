---
# rocketbase-dcra
title: Use row drag preview and remove move icon
status: completed
type: task
priority: normal
created_at: 2026-02-14T22:10:07Z
updated_at: 2026-02-14T22:12:00Z
---

Revert four-arrow icon in pages drag handle and make drag preview represent the row while keeping drag restricted to the handle.

## Progress Checklist

- [x] Remove four-arrow drag icon and keep grip icon
- [x] Keep drag preview as row (not icon)
- [x] Remove global cursor override after UX feedback
- [x] Validate table file diagnostics

## Summary of Changes

Updated `app/src/lib/components/admin/pages/data-table.svelte` to align drag UX with feedback:
- kept drag initiation restricted to handle button
- kept row-based drag preview (`setDragImage` with row element)
- removed the global body cursor override (`drag-reordering`) because it was not behaving as desired

Validation:
- Diagnostics check reported no issues.
