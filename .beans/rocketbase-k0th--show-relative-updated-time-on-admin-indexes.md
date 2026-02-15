---
# rocketbase-k0th
title: Show relative updated time on admin indexes
status: completed
type: bug
priority: normal
created_at: 2026-02-15T00:19:20Z
updated_at: 2026-02-15T00:27:10Z
---

Change Updated column display on /admin/pages and /admin/posts indexes to human-readable relative time (e.g. a few minutes ago, 1 hour ago, 3 days ago).

## Summary of Changes

- Added shared relative-time utility at app/src/lib/utils/relative-time.ts.
- Updated pages index Updated column in app/src/lib/utils/admin/pages-columns.ts to render human-readable relative time.
- Updated posts index Updated column in app/src/lib/utils/admin/posts-columns.ts to render human-readable relative time.

Validation:
- Ran app pnpm check with 0 errors and 0 warnings.
