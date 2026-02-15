---
# rocketbase-f99x
title: Add BitsUI multi-selector component
status: completed
type: feature
priority: normal
created_at: 2026-02-15T02:31:22Z
updated_at: 2026-02-15T02:35:31Z
---

Create a reusable Svelte multi-selector component following shadcn-svelte combobox/command/popover patterns and replace authors/tags multi-select in post form.

## Summary of Changes

- Added a reusable `MultiSelect` Svelte component at `app/src/lib/components/ui/multi-select/multi-select.svelte` using Popover + Command patterns from shadcn-svelte/Bits UI.
- Added export barrel at `app/src/lib/components/ui/multi-select/index.ts`.
- Replaced native `<select multiple>` controls for `author` and `tags` in `app/src/lib/components/admin/posts/post-form.svelte` with the new component.
- Preserved server action compatibility by outputting hidden inputs for selected values so form posts still submit repeated `author`/`tags` fields.
- Verified with `pnpm check` in `app/` (0 errors, 0 warnings).
