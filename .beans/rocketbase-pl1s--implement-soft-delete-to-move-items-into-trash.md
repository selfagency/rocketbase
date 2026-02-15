---
# rocketbase-pl1s
title: Implement soft-delete to move items into trash
status: completed
type: feature
priority: normal
created_at: 2026-02-14T21:11:20Z
updated_at: 2026-02-15T08:34:31Z
parent: rocketbase-alnr
---

Change delete behavior for pages/posts: set published=false, visible=false, require_login=false, subscriber_only=false and in_trash=true instead of deleting records.

## Summary of Changes

Implemented soft-delete functionality for pages and posts:

1. **Modified delete actions** to update records instead of deleting them:
   - Set 
   - Set 
   - Set 
   - Set 
   - Set 

2. **Added trash filter** to load functions to exclude trashed items from default views:
   - Pages: Added  filter
   - Posts: Added  filter

Files modified:
- app/src/routes/admin/pages/+page.server.ts
- app/src/routes/admin/posts/+page.server.ts

Trashed items are now hidden from normal views and can be recovered later.
