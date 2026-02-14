---
# rocketbase-eg7b
title: Place publish date adjacent to updated
status: completed
type: task
priority: normal
created_at: 2026-02-14T21:35:36Z
updated_at: 2026-02-14T21:35:52Z
---

Adjust /admin/posts column order so Publish Date is directly next to Updated.

## Summary of Changes

- Updated app/src/lib/utils/admin/posts-columns.ts column order so Publish Date is directly adjacent to Updated.
- Reordered the relevant section to: Visible, Published, Publish Date, Updated.

Validation:
- File diagnostics: no errors in app/src/lib/utils/admin/posts-columns.ts
