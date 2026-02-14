---
# rocketbase-p9dv
title: Swap visible and publish date columns in admin posts
status: completed
type: task
priority: normal
created_at: 2026-02-14T21:34:24Z
updated_at: 2026-02-14T21:34:46Z
---

Reorder /admin/posts table so Visible and Publish Date columns are swapped.

## Summary of Changes

- Swapped the Visible and Publish Date columns in app/src/lib/utils/admin/posts-columns.ts.
- New order in the posts table section is now: Published, Visible, Publish Date, Updated.

Validation:
- File diagnostics: no errors in app/src/lib/utils/admin/posts-columns.ts
