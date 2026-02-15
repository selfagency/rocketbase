---
# rocketbase-sqr8
title: Add preview action and tooltips to page list buttons
status: completed
type: task
priority: normal
created_at: 2026-02-14T20:49:59Z
updated_at: 2026-02-15T08:34:32Z
parent: rocketbase-alnr
---

In admin pages list actions, add preview button (Lucide view icon) before edit and add tooltips to preview/edit/delete buttons for clarity.

## Summary of Changes

- Added a Preview action button (Lucide eye/view icon) before Edit in `app/src/lib/components/admin/pages/data-table-actions.svelte`.
- Preview action opens `/preview/pages/:id` in a new tab.
- Added tooltips to all page action buttons: Preview page, Edit page, Delete page.
