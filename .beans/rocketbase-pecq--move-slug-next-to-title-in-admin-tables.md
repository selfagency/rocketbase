---
# rocketbase-pecq
title: Move slug next to title in admin tables
status: completed
type: task
priority: normal
created_at: 2026-02-14T21:33:23Z
updated_at: 2026-02-14T21:33:45Z
---

Reorder columns so Slug is immediately after Title on both /admin/posts and /admin/pages tables.

## Summary of Changes

- Reordered columns in app/src/lib/utils/admin/posts-columns.ts so Slug appears immediately after Title.
- Verified app/src/lib/utils/admin/pages-columns.ts already had Slug immediately after Title, so no code change was needed there.

Validation:
- File diagnostics: no errors in posts-columns.ts or pages-columns.ts
