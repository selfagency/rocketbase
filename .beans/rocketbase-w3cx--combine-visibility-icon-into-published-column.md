---
# rocketbase-w3cx
title: Combine visibility icon into published column
status: completed
type: task
priority: normal
created_at: 2026-02-14T21:36:17Z
updated_at: 2026-02-14T21:41:04Z
---

Remove Visible column from /admin/posts and show smaller visibility icon next to Published badge.

## Summary of Changes

- Updated admin posts table date column label in app/src/lib/utils/admin/posts-columns.ts from Publish Date to Date.

Validation:
- File diagnostics: no errors in app/src/lib/utils/admin/posts-columns.ts


## Summary of Changes

Updated both admin tables so visibility only renders an icon when a row is hidden:
- Posts:  now shows only  when .
- Pages: merged Published + Visibility into a single  and removed the standalone Visible column.
- Visible rows now show no visibility icon in both tables.

## Correction Note

Correcting formatting from prior shell interpolation.

Updated both admin tables so visibility only renders an icon when a row is hidden:
- Posts: publish-visibility-cell now shows only EyeOff when visible is false.
- Pages: merged Published + Visibility into a single PublishVisibilityCell and removed the standalone Visible column.
- Visible rows now show no visibility icon in both tables.
