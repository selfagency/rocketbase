---
# rocketbase-spwq
title: Add PocketBase cron cleanup for stale trash items
status: completed
type: task
priority: normal
created_at: 2026-02-14T21:11:20Z
updated_at: 2026-02-14T22:50:54Z
---

Add a PocketBase hook cron job to permanently delete pages/posts with in_trash=true after 30 days.

## Summary of Changes

Implemented PocketBase cron job to automatically delete stale trash items:

1. **Created cron hook** (`10-trash-cleanup-cron.pb.js`):
   - Runs daily at 2:00 AM
   - Finds pages and posts with `in_trash = true` AND `updated <= 30 days ago`
   - Permanently deletes matching records
   - Logs deletion counts and errors

2. **Cron schedule**: `0 2 * * *` (daily at 2:00 AM)

3. **Deletion criteria**:
   - Items must have `in_trash = true`
   - Items must have `updated` timestamp older than 30 days
   - Processes up to 500 items per collection per run

4. **Error handling**:
   - Catches and logs errors for individual deletions
   - Continues processing even if some deletions fail
   - Logs overall completion status

Files created:
- db/pb_hooks/10-trash-cleanup-cron.pb.js

Trashed items are now automatically cleaned up after 30 days.
