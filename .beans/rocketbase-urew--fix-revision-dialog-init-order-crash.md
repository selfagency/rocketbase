---
# rocketbase-urew
title: Fix revision dialog init order crash
status: completed
type: bug
priority: normal
created_at: 2026-02-15T02:39:29Z
updated_at: 2026-02-15T08:22:58Z
parent: rocketbase-alnr
---

Resolve ReferenceError in revision-history-dialog.svelte where visibleRevisions is accessed before initialization on /admin/posts/:id.

## Summary of Changes

- Fixed runtime `ReferenceError` in `app/src/lib/components/admin/revisions/revision-history-dialog.svelte` by reordering derived declarations.
- `revisionDiffCounts` and `visibleRevisions` are now declared before `selectedRevision`, so `selectedRevision` no longer references `visibleRevisions` in the temporal dead zone during SSR.

Validation:
- `pnpm check` in `app/` passed with 0 errors and 0 warnings.
