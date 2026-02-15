---
# rocketbase-l73r
title: Fix missing exportRecord in request audit hooks
status: completed
type: bug
priority: normal
created_at: 2026-02-15T16:30:31Z
updated_at: 2026-02-15T16:31:38Z
---

Resolve ReferenceError: exportRecord is not defined in request audit logging hooks.

## Summary of Changes

- Removed external `exportRecord` helper usage from request audit callbacks to avoid runtime ReferenceError.
- Moved record serialization into `writeRequestAudit` via a local `serializeRecord` function.
- Callbacks now pass raw record/original record objects and let `writeRequestAudit` convert to exported payloads.
- This prevents repeated `[Audit] *_request failed: ReferenceError: exportRecord is not defined` log spam.
