---
# rocketbase-pk4x
title: Match pages thumbnail size to posts
status: completed
type: bug
priority: normal
created_at: 2026-02-15T00:17:16Z
updated_at: 2026-02-15T08:23:08Z
parent: rocketbase-alnr
---

Make admin/pages list thumbnails render at the same size as admin/posts list thumbnails.

## Summary of Changes

- Updated page thumbnail fallback icon in  to  to match posts list sizing.
- Normalized page thumbnail image class ordering/style to match posts ().
- Ran undefined
 ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "check" not found in  and confirmed 0 errors, 0 warnings.

## Summary Correction

- Updated pages thumbnail fallback icon class in app/src/lib/utils/admin/pages-columns.ts to h-12 w-12, matching posts.
- Ensured pages thumbnail image uses h-12 w-12 rounded object-cover, matching posts.
- Verified with app-level pnpm check: 0 errors, 0 warnings.
