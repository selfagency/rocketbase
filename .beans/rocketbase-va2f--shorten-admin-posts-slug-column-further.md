---
# rocketbase-va2f
title: Shorten admin posts slug column further
status: completed
type: task
priority: normal
created_at: 2026-02-14T21:23:50Z
updated_at: 2026-02-15T08:34:33Z
parent: rocketbase-jl6x
---

Reduce slug cell width in admin posts table to make truncation more aggressive.

## Summary of Changes

- Reduced slug cell width in app/src/lib/utils/admin/posts-columns.ts for more aggressive truncation.
- Changed slug cell max width from 16rem to 10rem equivalent utility ().
- Aligned nearby width utility classes with standard Tailwind classes to satisfy lint-style rules.

Validation:
- File diagnostics: no errors in app/src/lib/utils/admin/posts-columns.ts

## Corrections

The summary line dropped a utility class name due shell interpolation. Correct value:
- slug max width utility: max-w-40
