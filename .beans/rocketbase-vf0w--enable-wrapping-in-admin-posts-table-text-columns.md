---
# rocketbase-vf0w
title: Enable wrapping in admin posts table text columns
status: completed
type: bug
priority: normal
created_at: 2026-02-15T00:01:13Z
updated_at: 2026-02-15T00:02:31Z
---

## Problem\nChanging  doesn't visibly affect truncation because text cells are forced into non-wrapping/truncate behavior.\n\n## Checklist\n- [x] Verify nowrap/truncate constraints in posts table\n- [x] Allow wrapping/clamped text for selected posts columns\n- [x] Validate diagnostics


## Summary of Changes

Confirmed root cause of "columnWidthClasses does nothing":
- Cell/content behavior was forcing no-wrap/truncate, so width tweaks had little visible effect.
- One width utility was invalid (`max-w-18`), so it never applied.

Fixes applied in posts table:
- `app/src/lib/components/admin/posts/data-table.svelte`
  - Replaced invalid `max-w-18` with `max-w-[4.5rem]` for slug
  - Added per-column cell behavior map and applied `whitespace-normal wrap-break-word` for `title` and `author` cells
- `app/src/lib/utils/admin/posts-columns.ts`
  - Removed forced single-line truncation in title/author snippets
  - Title/author now render with wrapping classes (`whitespace-normal wrap-break-word`)

Validation:
- `pnpm check` (app) passed with 0 errors and 0 warnings.
