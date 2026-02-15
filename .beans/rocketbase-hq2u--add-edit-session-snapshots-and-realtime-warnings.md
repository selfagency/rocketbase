---
# rocketbase-hq2u
title: Add edit-session snapshots and realtime warnings
status: completed
type: feature
priority: normal
created_at: 2026-02-15T05:04:05Z
updated_at: 2026-02-15T05:06:24Z
---

Implement snapshots-backed autosave/recovery for admin post/page editors, plus realtime active-editor and record-changed warnings using a web worker and PocketBase subscriptions.

## Summary of Changes

- Added  with authenticated editor/admin GET/POST/DELETE handlers for snapshot recovery, autosave/heartbeat upserts, active-editor lookup, and target record updated timestamp checks.
- Added  to subscribe to snapshot and record updates via PocketBase realtime, with async-safe cleanup and active editor window pruning.
- Added  to manage autosave timers, heartbeat, recovery prompts, active-editor warnings, and record-changed warnings.
- Wired the guard into  and , including restore handlers that rehydrate superforms state.
- Validated with undefined
 ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "check" not found in  (pass).

## Summary of Changes (corrected)

- Added app/src/routes/api/admin/snapshots/+server.ts with authenticated editor/admin GET/POST/DELETE handlers for snapshot recovery, autosave/heartbeat upserts, active-editor lookup, and target record updated timestamp checks.
- Added app/src/lib/workers/editor-activity.worker.ts to subscribe to snapshot and record updates via PocketBase realtime, with async-safe cleanup and active editor window pruning.
- Added app/src/lib/components/admin/editor-session-guard.svelte to manage autosave timers, heartbeat, recovery prompts, active-editor warnings, and record-changed warnings.
- Wired the guard into app/src/routes/admin/posts/[id]/+page.svelte and app/src/routes/admin/pages/[id]/+page.svelte, including restore handlers that rehydrate superforms state.
- Validated with pnpm check in app/ (pass).
