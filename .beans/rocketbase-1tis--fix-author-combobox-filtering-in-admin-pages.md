---
# rocketbase-1tis
title: Fix author combobox filtering in admin pages
status: completed
type: bug
priority: normal
created_at: 2026-02-13T20:16:18Z
updated_at: 2026-02-13T20:17:55Z
---

The author combobox in admin/pages is not working due to: 1) Combobox using Svelte 4 event dispatcher in Svelte 5 project, 2) Server not filtering by author param


## Summary of Changes

Fixed the author combobox filtering in admin/pages with three changes:

1. **Updated Combobox component to Svelte 5**: Removed createEventDispatcher and added onchange callback prop
2. **Added server-side author filtering**: Extract author query parameter and add to PocketBase filter
3. **Updated data-table to use callback**: Changed from on:change event handler to onchange callback prop

The combobox now works correctly for filtering pages by author.
