---
# rocketbase-blre
title: add parent select to page editor
status: completed
type: task
priority: normal
created_at: 2026-02-14T20:16:37Z
updated_at: 2026-02-14T22:22:00Z
---

## Implementation Plan

- [x] Update server load functions to fetch available parent pages
- [x] Add parent select field to PageForm component  
- [x] Exclude current page and descendants from parent options (edit mode)
- [x] Test parent selection in both create and edit modes

## Summary of Changes

Successfully added parent page selection to both the create and edit page forms.

**Changes made:**

1. **Server load functions** ([app/src/routes/admin/pages/new/+page.server.ts](app/src/routes/admin/pages/new/+page.server.ts)):
   - Fetches all pages for parent selection dropdown
   - Returns `availableParents` array to the page component

2. **Edit page server load** ([app/src/routes/admin/pages/\[id\]/+page.server.ts](app/src/routes/admin/pages/[id]/+page.server.ts)):
   - Added `getDescendantIds()` helper function to prevent circular references
   - Fetches all pages and filters out current page and its descendants
   - Returns filtered `availableParents` array

3. **Page form component** ([app/src/lib/components/admin/pages/page-form.svelte](app/src/lib/components/admin/pages/page-form.svelte)):
   - Added `availableParents` prop with PagesResponse[] type
   - Added parent select field with "None (Top Level)" default option
   - Field includes description: "Select a parent page to create a hierarchy"
   - Uses consistent styling with existing collection select field

4. **Route pages updated**:
   - [app/src/routes/admin/pages/new/+page.svelte](app/src/routes/admin/pages/new/+page.svelte): passes availableParents to PageForm
   - [app/src/routes/admin/pages/\[id\]/+page.svelte](app/src/routes/admin/pages/[id]/+page.svelte): passes availableParents to PageForm

**Features:**
- ✅ Prevents circular parent-child relationships in edit mode
- ✅ Shows "None (Top Level)" option for pages without parents
- ✅ Alphabetically sorted by title for easy selection
- ✅ Type-safe implementation with no TypeScript errors
- ✅ Consistent UI styling with existing form fields
