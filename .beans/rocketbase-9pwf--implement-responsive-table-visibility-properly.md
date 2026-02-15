---
# rocketbase-9pwf
title: Implement responsive table visibility properly
status: completed
type: task
priority: normal
created_at: 2026-02-15T03:32:52Z
updated_at: 2026-02-15T03:38:26Z
---

Use TanStack columnVisibility state for admin posts/pages tables: hide slug+summary below lg, keep status compact on mobile, show status dot with tooltip below md, and place Create actions in page headers.

- Follow-up tweak: on admin posts table, made title wider and author narrower on smaller breakpoints (title: min-w-72/max-w-40rem, author: min-w-14/max-w-24 with lg overrides). Validation: pnpm check (app) passed with 0 errors and 0 warnings.

- Follow-up tweak: admin posts summary/slug visibility now switches at xl (1280px) instead of lg; below 1280 these extended columns are hidden.

## Summary of Changes

- Updated admin posts table responsive visibility logic so  and  are shown only at  and above ().
- Below , extended columns are hidden as requested.
- Validation: undefined
 ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "check" not found in  passed with 0 errors and 0 warnings.

## Summary of Changes (Corrected)

- Updated admin posts table responsive visibility logic so `slug` and `summary` are shown only at `xl` and above (`>= 1280px`).
- Below `1280px`, the extended columns are hidden as requested.
- Validation: `pnpm check` in `app/` passed with 0 errors and 0 warnings.
