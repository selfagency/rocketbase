---
# rocketbase-f43r
title: Show hierarchical order labels in admin pages
status: completed
type: task
priority: normal
created_at: 2026-02-14T20:46:20Z
updated_at: 2026-02-14T20:47:34Z
---

Display admin page order using hierarchical labels (e.g., parent order-child index like 3-1 for subpages) instead of flat sequence for nested pages.

## Summary of Changes

- Added hierarchical `orderLabel` generation in `app/src/lib/utils/page-hierarchy.ts` while flattening page trees.
- Updated admin pages order column rendering in `app/src/lib/utils/admin/pages-columns.ts` to display `orderLabel` (fallback to numeric order).
- Added/updated tests in `app/src/tests/lib/utils/page-hierarchy.test.ts` to verify nested label behavior, including `3-1` style labels for child pages.
