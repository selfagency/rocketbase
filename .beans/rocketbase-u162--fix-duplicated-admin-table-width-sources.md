---
# rocketbase-u162
title: Fix duplicated admin table width sources
status: completed
type: bug
priority: normal
created_at: 2026-02-14T23:51:03Z
updated_at: 2026-02-15T08:22:14Z
parent: rocketbase-alnr
---

## Problem\nColumn widths in admin data tables appear to be defined in multiple places, causing conflicting sizing behavior.\n\n## Checklist\n- [x] Identify all width definitions for admin pages/posts tables\n- [x] Consolidate width control to a single source of truth\n- [x] Verify pages and posts tables render with intended sizing\n- [x] Run app checks for affected files


## Summary of Changes

Adjusted admin table column sizing to improve horizontal fit while keeping explicit min/max bounds:
- Pages index:
  - Narrowed `slug` column to `min-w-16 max-w-24`
  - Tightened `actions` column to `w/min/max-16`
- Posts index:
  - Narrowed `image` (thumbnail) column to `w/min/max-10` with reduced right padding
  - Narrowed `published`, `date`, and `updated` to `w/min/max-20`
  - Expanded `author` width range to `min-w-28 max-w-48` for better content room

Validation:
- `pnpm check` (app) passed with 0 errors and 0 warnings.
