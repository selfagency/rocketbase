---
# rocketbase-xwlw
title: Implement revision history for posts and pages
status: completed
type: feature
priority: normal
created_at: 2026-02-15T01:51:48Z
updated_at: 2026-02-15T02:02:26Z
---

## Goal\nImplement revision history views for admin posts and pages backed by audit_logs and visual diffs using svelte-diff-match-patch.\n\n## Checklist\n- [x] Review existing audit_logs schema/hooks and admin route patterns\n- [x] Add server-side revision history loading for posts and pages\n- [x] Add UI components/routes to browse revisions and inspect changes\n- [x] Integrate svelte-diff-match-patch for content field diffs\n- [x] Validate with targeted diagnostics and document summary

## Summary of Changes

- Fixed the runtime-breaking syntax error in `app/src/routes/admin/pages/[id]/+page.server.ts` by restoring the `actions` object structure (`default` and `restoreRevision` are now separate valid actions).
- Ensured revision author attribution resolves from expanded audit log user data in `app/src/lib/server/revision-history.ts` (with sensible fallback labels).
- Added missing `timestamp` and `created` fields to post revision restore fetch in `app/src/routes/admin/posts/[id]/+page.server.ts`.
- Added PocketBase hook `db/pb_hooks/11-audit-revisions-retention.pb.js`:
  - Reads `metadata` key `revisions_kept`.
  - Applies retention to post revisions in `audit_logs` (`collection_name = "posts"`, event type `create`/`update`).
  - Keeps newest N revisions per post.
  - If `revisions_kept = -1` (or invalid/missing), retention is unlimited.

## Validation Notes

- IDE diagnostics report no errors in modified app and hook files.
- `pnpm check` was attempted twice in this session but interrupted externally (exit 130), so targeted diagnostics were used for verification.

## Summary of Changes\n\n- Fixed syntax error in app/src/routes/admin/pages/[id]/+page.server.ts actions block.\n- Improved revision author resolution from expanded audit log user data in app/src/lib/server/revision-history.ts.\n- Added timestamp/created fields to post restore revision fetch in app/src/routes/admin/posts/[id]/+page.server.ts.\n- Added db/pb_hooks/11-audit-revisions-retention.pb.js to enforce metadata.revisions_kept per-post revision retention (-1 = unlimited).\n\n## Validation Notes\n\n- Diagnostics show no errors in touched files.\n- pnpm check was interrupted twice in this environment (exit 130).
