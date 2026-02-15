---
# rocketbase-ho04
title: Fix PocketBase file URLs and add CDN support
status: completed
type: bug
priority: normal
created_at: 2026-02-14T04:58:09Z
updated_at: 2026-02-15T08:22:44Z
parent: rocketbase-56l8
---

Fix incorrect file URL formats across post components. PostCard uses wrong _superusers path, other components have extra /pb/ in path. Add CDN URL support via metadata.

## Issues Found

1. **PostCard.svelte**: Uses `/api/pb/_superusers/files/` - completely wrong collection
2. **PostHeader.svelte**: Uses `/api/pb/files/posts/` - has extra `/pb/` in path
3. **Post page meta tags**: Same issue with `/api/pb/files/posts/`

## Correct Format

According to PocketBase docs: `/api/files/COLLECTION_NAME/RECORD_ID/FILENAME`

## Tasks

- [ ] Fix PostCard.svelte image URL
- [ ] Fix PostHeader.svelte image URL
- [ ] Fix post page meta tags image URLs
- [ ] Add CDN URL to metadata migration
- [ ] Create helper function for file URLs with CDN support

- [x] Create file proxy route at /api/files/[...path]/+server.ts

## Summary of Changes

Successfully fixed PocketBase file URL issues and added CDN support throughout the application.

### Fixed Issues

1. **PostCard.svelte** - Corrected `/api/pb/_superusers/files/` to proper format
2. **PostHeader.svelte** - Removed extra `/pb/` from path
3. **Post page meta tags** - Fixed OpenGraph and Twitter card image URLs
4. **Added file proxy** - Created `/api/files/[...path]/+server.ts` to proxy file requests to PocketBase

### New Features

1. **CDN Support** - Added `cdn_url` metadata key for optional CDN configuration
2. **Helper Function** - Created `getFileUrl()` in utils.ts for consistent file URL generation
3. **Migration Update** - Added `cdn_url` to metadata migration for easy CDN configuration

### Files Modified

- `app/src/lib/utils.ts` - Added `getFileUrl()` helper
- `app/src/lib/components/posts/PostCard.svelte` - Fixed image URLs, added CDN support
- `app/src/lib/components/posts/PostHeader.svelte` - Fixed image URLs, added CDN support
- `app/src/lib/components/posts/PostList.svelte` - Pass CDN URL to PostCard
- `app/src/routes/posts/+page.svelte` - Pass CDN URL to PostList
- `app/src/routes/posts/[slug]/+page.svelte` - Fixed meta tags, pass CDN URL to PostHeader
- `app/src/routes/api/files/[...path]/+server.ts` - New file proxy route
- `db/pb_migrations/1771043492_populate_default_metadata.js` - Added cdn_url key

### Correct URL Format

- **Without CDN**: `/api/files/COLLECTION_NAME/RECORD_ID/FILENAME`
- **With CDN**: `https://cdn.example.com/api/files/COLLECTION_NAME/RECORD_ID/FILENAME`

All file URLs now use the correct format and support optional CDN configuration.
