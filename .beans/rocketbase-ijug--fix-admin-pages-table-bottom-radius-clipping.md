---
# rocketbase-ijug
title: Fix admin pages table bottom radius clipping
status: completed
type: bug
priority: normal
created_at: 2026-02-14T20:48:00Z
updated_at: 2026-02-15T08:21:53Z
parent: rocketbase-alnr
---

Admin pages table loses visible bottom rounded corners after body background color changes. Ensure inner table backgrounds are clipped to container border radius.

## Summary of Changes

- Fixed admin pages table border-radius clipping by adding `overflow-hidden` to the rounded table wrapper in `app/src/lib/components/admin/pages/data-table.svelte`.
- This ensures table body background color does not visually square off bottom corners.
