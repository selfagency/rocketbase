---
# rocketbase-hcju
title: Fix admin posts table overflow and thumbnails visibility
status: completed
type: bug
priority: normal
created_at: 2026-02-14T21:21:18Z
updated_at: 2026-02-14T21:22:06Z
---

Ensure thumbnails are visible in /admin/posts and reduce horizontal overflow by truncating long title/authors/tags/slug cells.

## Summary of Changes

- Updated app/src/lib/utils/admin/posts-columns.ts to improve table fit and thumbnail reliability.
- Kept thumbnail rendering in the first column and hardened image markup by escaping values used in attributes.
- Added truncation with ellipsis for long text fields to reduce horizontal overflow:
  - title (max width + truncate)
  - authors (max width + truncate)
  - tags (max width + truncate)
  - slug (max width + truncate)
- Added title attributes to truncated fields so full values remain available on hover.

Validation:
- File diagnostics: no errors in app/src/lib/utils/admin/posts-columns.ts
- Workspace check surfaced an unrelated pre-existing error in app/src/lib/utils/slug-utils.ts (radashi kebab export), not introduced by this change.
