---
# rocketbase-cqm7
title: Rename published header to status on admin indexes
status: completed
type: task
created_at: 2026-02-14T21:57:40Z
updated_at: 2026-02-14T22:00:00Z
---

Change the published column header label to Status on both admin pages and admin posts indexes.

## Summary of Changes

- Updated `app/src/lib/utils/admin/pages-columns.ts` so the `published` column header now reads `Status`.
- Updated `app/src/lib/utils/admin/posts-columns.ts` so the `published` column header now reads `Status`.

## Validation

- Checked diagnostics for both column definition files; no errors found.
