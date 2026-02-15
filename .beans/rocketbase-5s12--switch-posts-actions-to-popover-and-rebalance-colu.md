---
# rocketbase-5s12
title: Switch posts actions to popover and rebalance columns
status: completed
type: bug
priority: normal
created_at: 2026-02-15T00:11:37Z
updated_at: 2026-02-15T08:23:28Z
parent: rocketbase-alnr
---

## Problem\nPosts index needs a wider title minimum, tighter slug/authors, slightly wider status, and a compact working actions control using vertical dots + popover.\n\n## Checklist\n- [x] Rebalance posts table width classes\n- [x] Replace dropdown actions with vertical-dots popover buttons\n- [x] Ensure actions UI works and fits within column\n- [x] Validate with diagnostics\n\n## Summary of Changes\n- Updated :\n  -  widened (, larger max)\n  -  narrowed\n  -  narrowed\n  -  slightly widened\n  -  tightened to compact trigger width\n- Updated :\n  - Replaced  with \n  - Switched trigger icon to vertical ellipsis ()\n  - Popover content now uses direct action buttons (Preview/Edit/Delete or Restore)\n  - Added controlled popover open state to close menu when action is selected\n\nValidation:\n- undefined
 ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "check" not found (app) passed with 0 errors and 0 warnings.

## Follow-up: posts filter/width tuning

Applied requested posts-index refinements in `app/src/lib/components/admin/posts/data-table.svelte`:
- Removed visible "Author" text label beside the author filter dropdown.
- Preserved accessibility by adding `aria-label="Filter by author"` on the select.
- Changed default dropdown option text from `All authors` to `All`.
- Narrowed `author` column further: `min-w-12 max-w-16`.
- Widened `updated` column further: `w-28 min-w-28 max-w-36 whitespace-nowrap`.

Validation:
- `pnpm check` (app) passed with 0 errors and 0 warnings.

## Follow-up: author default, date width, date sort icon

Additional posts-index adjustments in `app/src/lib/components/admin/posts/data-table.svelte`:
- Changed author filter default option from `All` back to `All authors`.
- Widened `date` column to `w-24 min-w-24 max-w-28 whitespace-nowrap`.
- Made `date` header sort indicator use the same `ArrowDownUpIcon` style as `updated` (removed the special date-only icon logic).

Validation:
- `pnpm check` (app) passed with 0 errors and 0 warnings.

## Summary of Changes

Completed posts table/action rebalance and follow-up typography/filter updates. Work is committed in issue-scoped commits and validated via app pnpm check.
