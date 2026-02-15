---
# rocketbase-dyz2
title: Fix Tooltip.Provider missing in admin posts
status: completed
type: bug
priority: normal
created_at: 2026-02-14T21:16:54Z
updated_at: 2026-02-15T08:23:03Z
parent: rocketbase-alnr
---

Resolve runtime error Context 'Tooltip.Provider' not found on /admin/posts by ensuring tooltip usage is wrapped with provider.

## Summary of Changes

- Identified that /admin/posts rendered tooltip roots in row actions without a surrounding Tooltip.Provider.
- Updated app/src/lib/components/admin/posts/data-table.svelte to import tooltip and wrap table markup in Tooltip.Provider.
- This aligns admin/posts with the existing admin/pages table pattern and resolves the runtime context error.

Validation:
- File diagnostics: no errors in app/src/lib/components/admin/posts/data-table.svelte
- pnpm check (app): 0 errors, 0 warnings
