---
# rocketbase-dj31
title: Fix admin pages author column display
status: completed
type: bug
priority: high
created_at: 2026-02-14T04:09:42Z
updated_at: 2026-02-14T04:11:55Z
---

The admin pages table is missing the author field in the rows being passed to columns.ts. Need to investigate the data loading in +page.server.ts to ensure author relation is properly expanded.


## Summary of Changes

Fixed the missing author field issue in the admin pages table by switching from manual author mapping to PocketBase's built-in `expand` parameter.

### Root Cause
The original implementation was fetching the `author` field as a string ID and attempting to manually map it to user objects. This manual mapping wasn't being preserved correctly through the hierarchical data transformations (building the tree structure, flattening, and pagination).

### Solution
- Added `expand: 'author'` to the PocketBase query
- Simplified the author mapping by extracting from `pageItem.expand.author`
- Removed the redundant manual mapping logic
- The expanded author data is now correctly flattened to `pageItem.author` to match the `PagesResponseWithAuthor` type

### Testing
- TypeScript compilation: ✓ Passed
- svelte-check: ✓ No errors or warnings
- Ready for manual testing in the browser

### Files Modified
- [app/src/routes/admin/pages/+page.server.ts](app/src/routes/admin/pages/+page.server.ts)

### Commits
- 02d46f5: Initial WIP commit with author column work
- 41aa568: Final fix using PocketBase expand
