---
# rocketbase-qzr2
title: Rebalance pages index column widths
status: completed
type: task
priority: normal
created_at: 2026-02-14T22:13:24Z
updated_at: 2026-02-15T08:34:32Z
parent: rocketbase-iaak
---

Widen title/slug/summary columns, narrow status/date/updated/actions, and rename Published header to Status on pages index.

## Progress Checklist

- [x] Rename pages index published header to Status
- [x] Widen title, slug, and summary columns
- [x] Narrow status, date, updated, and actions columns
- [x] Validate updated files have no diagnostics errors

## Summary of Changes

Updated pages index table layout and labels:
- `app/src/lib/utils/admin/pages-columns.ts`
  - changed `published` header text to `Status`
- `app/src/lib/components/admin/pages/data-table.svelte`
  - added explicit header/cell width classes to rebalance table columns
  - widened `title`, `slug`, and `summary`
  - narrowed `published` (status), `created` (date), `updated`, and `actions`

Validation:
- Diagnostics check reported no issues for both updated files.
