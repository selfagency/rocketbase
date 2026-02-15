---
# rocketbase-z6w2
title: Retune posts table column balance
status: completed
type: bug
priority: normal
created_at: 2026-02-15T00:03:54Z
updated_at: 2026-02-15T08:23:19Z
parent: rocketbase-alnr
---

## Problem\nPosts table needs a new balance: thumbnails should be much larger, slug/authors narrower, status slightly wider, and actions should not clip.\n\n## Checklist\n- [x] Adjust posts column width classes per requested proportions\n- [x] Increase thumbnail render size to match wider image column\n- [x] Ensure actions column can display all inline actions without clipping\n- [x] Validate with diagnostics


## Follow-up tweak

- Centered `title` and `author` content within row height by switching cell behavior from `align-top` to `align-middle` in `app/src/lib/components/admin/posts/data-table.svelte`.

Validation:
- `pnpm check` (app) passed with 0 errors and 0 warnings.
