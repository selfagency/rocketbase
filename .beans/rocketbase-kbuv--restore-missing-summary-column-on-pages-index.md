---
# rocketbase-kbuv
title: Restore missing summary column on pages index
status: completed
type: bug
priority: normal
created_at: 2026-02-14T22:11:21Z
updated_at: 2026-02-14T22:12:05Z
---

Re-add summary column in admin pages index after it was dropped by a later revert.

## Progress Checklist

- [x] Re-add summary column to pages index column config
- [x] Keep summary rendering truncated and readable
- [x] Validate column file diagnostics

## Summary of Changes

Restored the `summary` column in `app/src/lib/utils/admin/pages-columns.ts` after it was dropped by a later revert.
The column is sortable and uses a truncated display with fallback text.

Validation:
- Diagnostics check reported no issues.
