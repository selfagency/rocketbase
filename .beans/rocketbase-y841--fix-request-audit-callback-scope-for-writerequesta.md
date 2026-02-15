---
# rocketbase-y841
title: Fix request audit callback scope for writeRequestAudit
status: completed
type: bug
priority: normal
created_at: 2026-02-15T16:31:59Z
updated_at: 2026-02-15T16:34:17Z
---

Resolve ReferenceError: writeRequestAudit is not defined by making request audit callbacks self-contained and not dependent on cross-callback helper scope.

## Summary of Changes

- Root cause: PocketBase request callbacks were not reliably resolving shared top-level helpers (`writeRequestAudit`).
- Made each request callback self-contained with local audit-writing logic and local record serializer.
- Removed dependence on cross-callback function scope, preventing `writeRequestAudit is not defined` runtime failures.
- Preserved existing audit payload fields and audit_logs guard behavior.
