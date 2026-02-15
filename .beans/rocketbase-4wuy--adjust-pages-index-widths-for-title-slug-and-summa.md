---
# rocketbase-4wuy
title: Adjust pages index widths for title slug and summary
status: completed
type: task
priority: normal
created_at: 2026-02-14T22:01:29Z
updated_at: 2026-02-15T08:34:32Z
parent: rocketbase-iaak
---

Make title and slug columns slightly smaller and give summary a larger default width on admin pages index.

## Progress Checklist

- [x] Reduce title column width in pages index table
- [x] Reduce slug column width in pages index table
- [x] Increase default width available to summary column
- [x] Validate modified files have no diagnostics errors

## Summary of Changes

Adjusted `app/src/lib/components/admin/pages/data-table.svelte` column width classes:
- `title`: `w-[32%]` → `w-[28%]`
- `slug`: `w-[24%]` → `w-[18%]`
- `summary`: added `w-[28%]`

Updated `app/src/lib/utils/admin/pages-columns.ts` summary cell rendering to allow a larger default text width before truncation:
- `max-w-[24rem]` → `max-w-lg`

Validation:
- Diagnostics check passed for both modified files.
