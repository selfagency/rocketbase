---
# rocketbase-klyx
title: Add move cursor for drag and drop operations
status: todo
type: task
priority: low
created_at: 2026-02-14T02:26:59Z
updated_at: 2026-02-14T02:26:59Z
---

When dragging and dropping items (e.g., reordering pages in admin view), the cursor should change to the 4-arrow move cursor to indicate the drag operation.

## Requirements
- Cursor changes to `cursor: move` or `cursor: grab` when hovering over draggable items
- Cursor changes to `cursor: grabbing` when actively dragging
- Works across all drag/drop interfaces in the app

## Implementation
- Add CSS classes for drag states
- Apply to draggable elements via HTML attributes or JavaScript
- Consider using Tailwind utilities: `cursor-move`, `cursor-grab`, `cursor-grabbing`

## Files to Modify
- Components with drag/drop functionality
- Likely `app/src/routes/admin/pages/+page.svelte` (page reordering)
- Any other sortable lists in admin views
