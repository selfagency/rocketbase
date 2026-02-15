---
# rocketbase-668r
title: Tone down pages title and summary widths
status: completed
type: task
priority: normal
created_at: 2026-02-14T22:16:19Z
updated_at: 2026-02-15T08:34:33Z
parent: rocketbase-iaak
---

Reduce oversized title/summary columns and keep status/date/updated/actions compact on pages index.

## Progress Checklist

- [x] Reduce title column width
- [x] Reduce summary column width
- [x] Keep slug moderately wider than before
- [x] Keep status/date/updated/actions compact
- [x] Validate diagnostics

## Summary of Changes

Updated width mapping in `app/src/lib/components/admin/pages/data-table.svelte`:
- `title`: `24%` → `21%`
- `slug`: `14%` → `15%`
- `summary`: `29%` → `24%`
- `published/status`: `9%` → `8%`
- `created/date`: `7%` → `6%`
- `updated`: `7%` → `6%`
- `actions`: kept compact at `1%` with nowrap and tight padding

Validation:
- Diagnostics reported no issues.
