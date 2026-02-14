---
# rocketbase-hl37
title: Refine pages table sizing after visual regression
status: completed
type: bug
priority: normal
created_at: 2026-02-14T22:17:22Z
updated_at: 2026-02-14T22:17:57Z
---

Replace aggressive percentage-based widths with balanced utility/content sizing for pages index table.

## Progress Checklist

- [x] Remove aggressive percentage width layout
- [x] Keep utility columns fixed and compact
- [x] Keep content columns flexible but bounded
- [x] Validate diagnostics

## Summary of Changes

Updated  to replace the percentage-heavy column sizing with a more balanced setup:
- utility columns (, , , Sat Feb 14 17:17:48 EST 2026, , ) now use explicit compact widths
- content columns (, , ) now use moderate minimum widths (, , ) instead of oversized percentages
- removed  to avoid forcing awkward whitespace distribution

Validation:
- Diagnostics reported no issues for updated files.

## Corrected Summary

Applied a balanced sizing model for the pages index table:
- Utility columns are compact and fixed-width: order, image, status, date, updated, actions.
- Content columns are flexible with moderate minimum widths: title (min-w-56), slug (min-w-40), summary (min-w-48).
- Removed table-fixed to prevent the browser from forcing awkward whitespace distribution.

Validation:
- Diagnostics reported no issues for data-table.svelte and pages-columns.ts.
