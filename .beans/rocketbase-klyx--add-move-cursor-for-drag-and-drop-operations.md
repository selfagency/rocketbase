---
# rocketbase-klyx
title: Add move cursor for drag and drop operations
status: completed
type: task
priority: low
created_at: 2026-02-14T02:26:59Z
updated_at: 2026-02-14T22:00:00Z
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

## Summary of Changes

- Updated `app/src/lib/components/admin/pages/data-table.svelte` to apply `cursor-grab` on draggable rows and drag handle button.
- Kept active drag state styling with `cursor-grabbing` while the row is being dragged.
- Added `ondragend` handler to clear drag state cleanly after drag operations.

## Validation

- Checked diagnostics for `app/src/lib/components/admin/pages/data-table.svelte`; no errors found.
