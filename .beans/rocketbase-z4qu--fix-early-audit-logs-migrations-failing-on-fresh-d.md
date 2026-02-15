---
# rocketbase-z4qu
title: Fix early audit_logs migrations failing on fresh DB
status: completed
type: bug
priority: normal
created_at: 2026-02-15T15:46:45Z
updated_at: 2026-02-15T16:12:35Z
parent: rocketbase-56l8
---

Resolve migration failures like 1771121058_updated_audit_logs.js (sql: no rows in result set) by making early audit_logs update migrations resilient when collection does not yet exist.

## Summary of Changes

- Root cause: migration ordering means two early audit_logs update migrations can run before the audit_logs create migration on fresh databases.
- Added defensive guards in both early update migrations to no-op when pbc_audit_logs is missing, preventing the no rows in result set migration failure.
- Kept behavior unchanged when the audit_logs collection exists (rules are still applied as before).
