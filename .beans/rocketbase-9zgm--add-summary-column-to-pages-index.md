---
# rocketbase-9zgm
title: Add summary column to pages index
status: completed
type: task
priority: normal
created_at: 2026-02-14T21:59:46Z
updated_at: 2026-02-15T08:34:32Z
parent: rocketbase-iaak
---

Insert a Summary column in admin pages index table with concise rendering.

## Progress Checklist

- [x] Add summary column to pages index table config
- [x] Keep summary rendering compact for table readability
- [x] Validate updated file has no diagnostics errors

## Summary of Changes

Inserted a new `summary` column in `app/src/lib/utils/admin/pages-columns.ts` after `slug`.
The column is sortable (`sortKey: 'summary'`) and renders concise, truncated text for cleaner index layout.

Validation:
- `get_errors` on `pages-columns.ts` reported no issues.
