---
# rocketbase-i1nw
title: Enforce pages index column width rebalance
status: completed
type: bug
priority: normal
created_at: 2026-02-14T22:14:36Z
updated_at: 2026-02-15T08:21:41Z
parent: rocketbase-alnr
---

Make title/slug/summary visibly wider and status/date/updated/actions narrower using fixed table layout; ensure Published header is Status.

## Summary of Changes

Completed in commit 6d3821e94ca9dbe20f4af9ad140d850fcd576919.

This bean was part of a larger pages table improvement effort that:
- Rebalanced column widths for better content visibility
- Added fixed widths for action columns (status, dates)
- Reduced title/summary min-widths to prevent overflow
- Changed 'Published' header to 'Status' for clarity

Files modified:
- app/src/lib/components/admin/pages/data-table.svelte
- app/src/lib/utils/admin/pages-columns.ts
