---
# rocketbase-a4d1
title: Limit pages drag to handle and show move icon
status: completed
type: task
priority: normal
created_at: 2026-02-14T22:08:54Z
updated_at: 2026-02-15T08:34:32Z
parent: rocketbase-iaak
---

Restrict drag interaction in admin pages index to the handle button area and show a four-arrow move icon while dragging.

## Progress Checklist

- [x] Restrict drag start interaction to handle button area
- [x] Keep row as drop target for reorder operations
- [x] Show four-arrow move icon while a row is being dragged
- [x] Validate updated Svelte file diagnostics

## Summary of Changes

Updated `app/src/lib/components/admin/pages/data-table.svelte`:
- Removed row-level `draggable` and drag start/end handlers so dragging can only be initiated from the handle control.
- Added `draggable`, drag start/end handlers, and padded hit area to the handle button.
- Switched handle icon state while dragging from `GripVertical` to `Move` (four-arrow icon) for the active row.

Validation:
- Diagnostics check reported no issues for the updated Svelte file.
