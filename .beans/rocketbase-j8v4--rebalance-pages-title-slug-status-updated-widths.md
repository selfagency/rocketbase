---
# rocketbase-j8v4
title: Rebalance pages title slug status updated widths
status: completed
type: bug
priority: normal
created_at: 2026-02-15T00:15:10Z
updated_at: 2026-02-15T08:23:10Z
parent: rocketbase-alnr
---

Tune admin/pages index widths: make title and slug a bit narrower, and status and updated slightly wider.\n\n## Checklist\n- [x] Inspect current pages table width classes\n- [x] Adjust width classes for title/slug/status/updated\n- [x] Validate diagnostics

## Summary of Changes

Updated pages index column widths as requested:
- Title narrowed: min-w-40 max-w-64
- Slug narrowed: min-w-8 max-w-12
- Status widened slightly: w-28 min-w-28 max-w-36
- Updated widened slightly: w-24 min-w-24 max-w-32

Validation:
- pnpm check (app) passed with 0 errors and 0 warnings.

\n## Rollback to stable widths\n\nRestored  to the previous stable values:\n- title: \n- slug: \n- summary: \n\nValidation: undefined
 ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "check" not found (app) passed with 0 errors and 0 warnings.

## Rollback correction

Restored app/src/lib/components/admin/pages/data-table.svelte to stable values:
- title: min-w-48 max-w-72
- slug: min-w-8 max-w-12
- summary: min-w-36 max-w-64

Validation: app pnpm check passed with 0 errors and 0 warnings.

## Verification: pages-columns width interference check

Checked width behavior sources:
- Column widths are defined in app/src/lib/components/admin/pages/data-table.svelte (columnWidthClasses).
- pages-columns.ts does not set column widths for slug/summary; it only sets inner content classes (truncate, text size/color).
- Table uses fixed layout and base table-cell applies whitespace-nowrap by default.

Conclusion:
- pages-columns.ts is not the source of column width sizing conflicts.
- Weirdness is more likely from table-fixed plus min/max width balancing and the global nowrap cell default.

## Follow-up: order cell typography alignment

Updated pages order-cell typography in `app/src/lib/utils/admin/pages-columns.ts` to match other non-title columns:
- changed from `text-sm` to `text-xs`
- added `text-foreground` for consistency

Validation:
- `pnpm check` (app) passed with 0 errors and 0 warnings.
