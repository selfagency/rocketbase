---
# rocketbase-e7bz
title: Remove Created column from admin posts table
status: completed
type: task
priority: normal
created_at: 2026-02-14T21:28:00Z
updated_at: 2026-02-15T08:34:33Z
parent: rocketbase-jl6x
---

Remove the Created field/column from /admin/posts table view.

## Summary of Changes

- Removed the Created column definition from app/src/lib/utils/admin/posts-columns.ts.
- The admin posts table now omits Created while retaining Updated and other existing columns.

Validation:
- File diagnostics: no errors in app/src/lib/utils/admin/posts-columns.ts
