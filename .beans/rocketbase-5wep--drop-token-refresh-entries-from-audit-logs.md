---
# rocketbase-5wep
title: Drop token refresh entries from audit logs
status: completed
type: task
priority: normal
created_at: 2026-02-14T22:05:42Z
updated_at: 2026-02-15T08:34:32Z
parent: rocketbase-56l8
---

Stop writing token refresh auth events into audit_logs while keeping other auth auditing intact.

## Progress Checklist

- [x] Locate token refresh audit source
- [x] Disable token refresh audit writes
- [x] Validate updated hook file has no diagnostics errors

## Summary of Changes

Updated `db/pb_hooks/06-audit-auth-refresh.pb.js` to stop writing refresh events to `audit_logs`.
The hook is now an explicit pass-through (`e.next()`), so token refreshes are excluded while other auth audit hooks remain unchanged.

Validation:
- Diagnostics check on `06-audit-auth-refresh.pb.js` reported no issues.
