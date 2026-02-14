---
# rocketbase-fmm4
title: Add confirmation dialogs for delete and restore actions
status: completed
type: task
priority: normal
created_at: 2026-02-14T23:07:56Z
updated_at: 2026-02-14T23:12:15Z
---

Add AlertDialog components for delete and restore actions in pages and posts admin tables using shadcn-svelte


## Summary of Changes

Successfully added AlertDialog confirmation dialogs for delete and restore actions:

1. **Installed shadcn-svelte AlertDialog component**
   - Used `pnpm run add-ui alert-dialog -y -o`
   - Added all AlertDialog UI components to `src/lib/components/ui/alert-dialog/`

2. **Updated posts action component**
   - Replaced browser `confirm()` with AlertDialog for delete
   - Added confirmation dialog for restore action
   - Both dialogs show clear messaging about the action

3. **Updated pages action component**
   - Replaced browser `confirm()` with AlertDialog for delete
   - Added confirmation dialog for restore action  
   - Both dialogs show clear messaging about the action

4. **Dialog features**
   - Delete dialog: Warns that item will be moved to trash
   - Restore dialog: Explains item will be returned to draft status
   - Both have Cancel and Confirm buttons
   - State management prevents double-submits

Files modified:
- `app/src/lib/components/admin/posts/data-table-actions.svelte`
- `app/src/lib/components/admin/pages/data-table-actions.svelte`
- `app/src/lib/components/ui/alert-dialog/` (new)
- `app/src/lib/components/ui/button/` (updated by shadcn-svelte)
