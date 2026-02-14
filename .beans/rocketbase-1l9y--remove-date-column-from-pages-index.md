---
# rocketbase-1l9y
title: Remove date column from pages index
status: completed
type: task
priority: normal
created_at: 2026-02-14T21:56:17Z
updated_at: 2026-02-14T22:03:12Z
---

Remove the date/created column from admin pages index columns so pages index no longer shows a date column.

## Progress Checklist

- [x] Remove created/date column from pages index columns
- [x] Validate updated file diagnostics

## Summary of Changes

Updated `app/src/lib/utils/admin/pages-columns.ts` to remove the `created` column from the admin pages index.

Validation:
- Diagnostics check on `pages-columns.ts` reported no errors.
