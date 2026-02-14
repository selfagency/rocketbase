---
# rocketbase-yfsg
title: Fix admin posts thumbnail column rendering
status: completed
type: bug
priority: normal
created_at: 2026-02-14T21:18:00Z
updated_at: 2026-02-14T21:19:50Z
---

Admin posts table shows literal <img ...> markup text instead of rendering thumbnails in first column.

## Summary of Changes

- Fixed admin posts thumbnail cell rendering in app/src/lib/utils/admin/posts-columns.ts.
- Replaced raw HTML string return for image markup with a rendered snippet using createRawSnippet and renderSnippet, so the image element is rendered instead of shown as text.
- Switched file URL generation to getFileUrl('posts', id, image) and appended thumb query parameter.

Validation:
- File diagnostics: no errors in app/src/lib/utils/admin/posts-columns.ts
- pnpm check (app): 0 errors, 0 warnings
