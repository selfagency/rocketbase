---
# rocketbase-7d5m
title: Refine revision history modal UX
status: completed
type: task
priority: normal
created_at: 2026-02-15T02:07:30Z
updated_at: 2026-02-15T02:17:38Z
---

Update revision history interaction so history is displayed as a scrollable list; clicking a revision opens the revision details in a modal showing author/date/time above the diff and restore/cancel buttons below.


## Progress Checklist

- [x] Review current revision history component structure
- [x] Implement scrollable revisions list and click-to-open details modal
- [x] Ensure modal layout has author/date/time header and restore/cancel footer below diff
- [x] Run diagnostics/checks for touched files

## Summary of Changes

- Removed the revision-history trigger button flow and replaced it with an inline revision history section.
- Rendered revision history as a scrollable table at the bottom of both edit forms.
- Made table rows keyboard-accessible and clickable to open the selected revision in a modal.
- Kept modal content minimal with author/date at top, diff in the middle, and Restore/Cancel buttons below.
- Moved revision history placement to the bottom of post/page edit forms.

Validation:
- Svelte autofixer returned no issues after updates.
- Diagnostics reported no errors for touched Svelte files.
