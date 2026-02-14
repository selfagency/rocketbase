---
# rocketbase-qxuk
title: Add trash filter view for pages and posts admin lists
status: completed
type: feature
priority: normal
created_at: 2026-02-14T21:11:20Z
updated_at: 2026-02-14T22:50:06Z
---

Add a trash filter tab/view alongside All/Drafts/Published in /admin/pages and /admin/posts for records marked in_trash=true.

## Summary of Changes

Implemented trash filter view with undelete functionality for pages and posts:

1. **Added trash filter to load functions**:
   - Filter shows only items with `in_trash = true` when status is 'trash'
   - Excludes trashed items from all other views

2. **Added trash button to data tables**:
   - Pages: Added 'Trash' button to filter tabs
   - Posts: Added 'Trash' button to filter tabs

3. **Implemented undelete action**:
   - Created `undelete` action in both pages and posts server files
   - Sets `in_trash = false` to restore items

4. **Updated action buttons**:
   - Shows restore button (undo-2 icon) for trashed items
   - Shows delete button (trash icon) for non-trashed items
   - Both pages and posts have conditional action rendering

5. **Added i18n messages**:
   - admin.pages.trash
   - admin.pages.restore

Files modified:
- app/src/routes/admin/pages/+page.server.ts
- app/src/routes/admin/posts/+page.server.ts
- app/src/lib/components/admin/pages/data-table.svelte
- app/src/lib/components/admin/posts/data-table.svelte
- app/src/lib/components/admin/pages/data-table-actions.svelte
- app/src/lib/components/admin/posts/data-table-actions.svelte
- app/messages/en.json

Users can now view trashed items and restore them with the undo-2 icon button.
