---
# rocketbase-yywl
title: Widen pages title/slug and tighten actions spacing
status: completed
type: task
priority: normal
created_at: 2026-02-14T21:57:48Z
updated_at: 2026-02-15T08:34:33Z
parent: rocketbase-iaak
---

On admin pages index, give title and slug columns more room and remove excess whitespace around actions.

## Summary of Changes

- Updated `app/src/lib/components/admin/pages/data-table.svelte`:
  - allocated more table width to `title` and `slug` cells.
  - tightened `actions` header/cell spacing with right alignment and reduced horizontal padding.
  - set compact widths for non-content columns (`published`, `updated`) to free room for content columns.
- Updated `app/src/lib/components/admin/pages/data-table-actions.svelte`:
  - reduced internal action button group gap and right-aligned actions to remove excess white space.

## Validation

- Checked diagnostics for updated Svelte files; no errors found.
