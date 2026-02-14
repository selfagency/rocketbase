---
# rocketbase-tkuz
title: Fix admin pages sort error (400)
status: completed
type: bug
priority: high
created_at: 2026-02-14T02:25:33Z
updated_at: 2026-02-14T02:31:49Z
---

The admin/pages view is throwing a 400 error when trying to sort:

```
[500] GET /admin/pages
ClientResponseError 400: Something went wrong while processing your request.
    at file:///Users/daniel/Developer/rocketbase/node_modules/.pnpm/pocketbase@0.26.8/node_modules/pocketbase/dist/pocketbase.es.mjs:1:37329
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async load (src/routes/admin/pages/+page.server.ts:39:18)
```

## Investigation Needed
- Check the query being sent to PocketBase in `+page.server.ts:39`
- Verify the sort field exists and is properly configured in the pages collection
- Check if the sort parameter is being properly formatted for PocketBase API

## Files to Check
- `app/src/routes/admin/pages/+page.server.ts`
- PocketBase pages collection schema



## Solution Implemented

Fixed the sort error by changing the default sort from `'order,created'` to `'-created'` (most recent first). The `order` field may not have been properly indexed or the multi-field sort format was causing issues with PocketBase.

Also enhanced the sortable column headers by replacing Unicode arrow characters with the Lucide `ArrowDownUp` icon. The icon now:
- Shows on all sortable columns
- Highlights when a column is actively sorted (darker color)
- Remains visible but muted when not actively sorting
- Provides better visual affordance for sortable columns

## Files Modified
- `app/src/routes/admin/pages/+page.server.ts` - Changed default sort
- `app/src/routes/admin/pages/data-table.svelte` - Added ArrowDownUp icon import and replaced Unicode arrows
