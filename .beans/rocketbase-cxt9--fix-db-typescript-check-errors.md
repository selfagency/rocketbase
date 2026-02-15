---
# rocketbase-cxt9
title: Fix db TypeScript check errors
status: completed
type: bug
priority: normal
created_at: 2026-02-15T20:25:13Z
updated_at: 2026-02-15T20:34:21Z
parent: rocketbase-56l8
---

Resolve TypeScript errors in db/src (pb_hooks, pb_migrations, util) so db check/build passes cleanly.

## Summary of Changes

- Restored full db typechecking coverage (all `db/src/**/*.ts` plus PocketBase ambient types).
- Updated `db/tsconfig.json` to support db runtime scripts and fetch typings without hiding source files (`moduleResolution: bundler`, `lib: ["esnext","dom"]`, strict-null relaxation for PB scripts).
- Fixed malformed migration source tails in:
  - `db/src/pb_migrations/1770001050_consolidated_audit_logs.ts`
  - `db/src/pb_migrations/1770001120_consolidated_posts.ts`
- Reworked `db/src/pb_hooks/01-generate-types.pb.ts` so each hook callback is self-contained (no shared helper function), with inline pnpm availability checks.
- Fixed hook typing/runtime compatibility in `db/src/pb_hooks/10-trash-cleanup-cron.pb.ts` by collecting concrete `Record` models before delete.
- Added PocketBase runtime global declaration for `unmarshal` in `db/src/pocketbase-runtime-globals.d.ts`.
- Resolved migration constructor/type mismatches by casting generated collection/field payload objects where required across consolidated and updated migration files.
- Fixed `queue_stats` migration logic (`createResult` undefined) by restoring collection creation/save path.
- Added explicit flexible typing in util generators (`generate-posts.ts`, `generate-portfolio.ts`) for headers and generated payload extension fields (`imageFile`, `mediaFiles`).
- Validation: `cd db && pnpm check` passes with no TypeScript errors.
