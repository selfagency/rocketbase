---
# rocketbase-zeqb
title: Show boxed empty revision state
status: completed
type: task
priority: normal
created_at: 2026-02-15T02:28:22Z
updated_at: 2026-02-15T02:30:03Z
---

Keep revision history box visible even with zero revisions and center the empty-state message inside the box.

## Progress Checklist

- [x] Keep revision headers visible in boxed empty state
- [x] Center empty-state message within table box
- [x] Validate diagnostics for touched file

## Summary of Changes

Updated `app/src/lib/components/admin/revisions/revision-history-dialog.svelte`:
- Always render the table (including headers).
- For empty state, render a centered full-width row (`colspan=4`) with "No revisions found.".

Validation:
- Diagnostics report no errors in touched file.
