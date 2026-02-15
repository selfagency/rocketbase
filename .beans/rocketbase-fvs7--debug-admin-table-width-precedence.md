---
# rocketbase-fvs7
title: Debug admin table width precedence
status: completed
type: bug
priority: normal
created_at: 2026-02-14T23:57:11Z
updated_at: 2026-02-14T23:59:08Z
---

## Problem\nColumn width changes in data-table.svelte do not visually apply; likely conflicting/overriding width constraints in table wrappers or column cell render snippets.\n\n## Checklist\n- [x] Verify actual width precedence path for pages/posts tables\n- [x] Remove/align conflicting width constraints\n- [x] Validate with diagnostics


## Summary of Changes

Confirmed your suspicion: width behavior was being constrained by content-level classes/components, not just `columnWidthClasses`.

Fixes applied:
- Removed intrinsic width pressure in `posts-columns.ts`:
  - Thumbnail/icon reduced from 8 to 7 and removed `min-w-8` on thumbnail image
  - Date/updated text switched to `text-xs` for tighter fit
- Prevented action buttons from forcing wide action columns on medium screens:
  - `pages/data-table-actions.svelte`: inline actions now `lg:flex`, dropdown `lg:hidden`
  - `posts/data-table-actions.svelte`: inline actions now `lg:flex`, dropdown `lg:hidden`
- Reduced status pill footprint in both tables:
  - `pages/publish-visibility-cell.svelte`
  - `posts/publish-visibility-cell.svelte`
  - chips now use smaller padding + 11px text while preserving readable labels

Validation:
- `pnpm check` (app) passed with 0 errors and 0 warnings.
