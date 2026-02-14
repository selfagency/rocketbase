---
# rocketbase-r7ux
title: Fix PocketBase audit logs missing app data
status: completed
type: bug
created_at: 2026-02-14T21:47:31Z
updated_at: 2026-02-14T22:05:00Z
---

Investigate audit hooks and audit_logs schema; ensure before/after changes and request metadata are captured consistently for app CRUD/auth paths.

## Summary of Changes

- Added request-level record audit hooks in `db/pb_hooks/09-audit-record-requests.pb.js` for `create_request`, `update_request`, and `delete_request`.
- Enriched model hooks (`02-04`) with `before_changes` and/or `after_changes` snapshots to improve data completeness for non-request operations.
- Enriched auth hooks (`05-08`) with `request_method`, `request_url`, and `request_ip`; linked `user` when the auth record belongs to `users`.
- Ensured `e.next()` is always called on early returns to avoid breaking hook chains.

## Validation

- Checked diagnostics for all modified hook files; no errors reported.
