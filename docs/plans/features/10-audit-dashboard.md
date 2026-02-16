# Activity Audit Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an admin dashboard to inspect audit logs for security, compliance, and debugging.

## Overview

### User Stories

- Admins can search/filter audit events by actor, action, resource, and date.
- Admins can inspect event details including request metadata.
- Admins can export filtered audit data.

### Success Criteria

- ✅ Fast filtered log browsing
- ✅ Event detail view with request context
- ✅ Export CSV/JSON for selected window
- ✅ Retention policy visibility
- ✅ Tests for filters and export behavior

## Scope

### In Scope

- Existing `audit_logs` data visualization
- Filter presets + pagination
- Export endpoint with role restrictions

### Out of Scope

- SIEM push integrations
- Long-term cold-storage ETL pipelines

## Research Phase

1. Review current audit hooks and schema fields.
2. Identify high-cardinality filters and index needs.
3. Define PII masking/redaction requirements.

## Development Phase

1. Build dashboard route with server-side querying.
2. Add filter bar (date, actor, event type, target collection).
3. Add detail pane and raw payload toggle.
4. Add export action with guardrails.

## Testing Phase

- Unit: filter query builders
- Integration: date range + actor filtering
- E2E: inspect event + export flow
- Security: admin-only enforcement

## Documentation

- `docs/user-guide/audit-dashboard.md`
- retention + redaction policy notes

## Completion Checklist

- [ ] dashboard and filters complete
- [ ] event details complete
- [ ] export complete
- [ ] tests passing
- [ ] docs updated
