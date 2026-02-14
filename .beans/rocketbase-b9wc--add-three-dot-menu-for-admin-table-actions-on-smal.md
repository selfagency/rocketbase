---
# rocketbase-b9wc
title: Add three-dot menu for admin table actions on small screens
status: completed
type: task
priority: normal
created_at: 2026-02-14T22:46:38Z
updated_at: 2026-02-14T23:22:01Z
---

When the viewport is too small to show action buttons in admin tables (pages, posts), put them behind a three-dot menu button instead of showing them inline.


## Requirements

1. Add three-dot menu (dropdown) for action buttons on small screens
2. Make table columns responsive width so they shrink/expand with screen size
3. Apply to both pages and posts admin tables


## Summary of Changes

Successfully implemented responsive action menus and column widths for admin tables:

1. **Responsive Action Menu**
   - Added dropdown menu with three-dot ellipsis icon for small screens (< md / 768px)
   - Inline buttons visible on medium+ screens (md and above)
   - Uses Tailwind responsive classes (`hidden md:flex` and `md:hidden`)
   - Applied to both pages and posts admin tables

2. **Responsive Column Widths**
   - Updated posts table columns with responsive max-width classes
   - Title: scales from `max-w-32` to `max-w-none` across breakpoints
   - Slug: scales from `max-w-24` to `max-w-none`
   - Authors: scales from `max-w-24` to `max-w-56`
   - Tags: scales from `max-w-20` to `max-w-48`
   - Pages table already had responsive behavior

3. **Dropdown Menu Features**
   - Preview, Edit, Delete/Restore actions all available
   - Proper disabled states maintained
   - Separator between edit and delete/restore
   - Destructive styling for delete action
   - Screen reader support with sr-only label

Files modified:
- `app/src/lib/components/admin/posts/data-table-actions.svelte`
- `app/src/lib/components/admin/pages/data-table-actions.svelte`
- `app/src/lib/utils/admin/posts-columns.ts`

The tables now provide a better experience on mobile devices while
maintaining the full functionality on desktop.
