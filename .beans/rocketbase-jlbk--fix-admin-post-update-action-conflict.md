---
# rocketbase-jlbk
title: Fix admin post update action conflict
status: completed
type: bug
priority: normal
created_at: 2026-02-15T03:38:46Z
updated_at: 2026-02-15T08:21:56Z
parent: rocketbase-alnr
---

Resolve SvelteKit error on POST /admin/posts/[id]: named actions mixed with default action in route actions.

## Summary of Changes

- Fixed SvelteKit action conflict on `/admin/posts/[id]` where a `default` action was mixed with a named action (`restoreRevision`), which caused 500s on post update.
- Renamed the edit submit action from `default` to `update` in `app/src/routes/admin/posts/[id]/+page.server.ts`.
- Updated the edit form to submit to the named action with `action={isEdit ? '?/update' : undefined}` in `app/src/lib/components/admin/posts/post-form.svelte`.
- Kept create/new flow unchanged (still uses default action on `/admin/posts/new`).

Validation:
- `pnpm check` in `app/` passed with 0 errors and 0 warnings.
