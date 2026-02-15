---
# rocketbase-ndx6
title: Integrate Webfinger using PocketBase metadata
status: todo
type: task
priority: normal
created_at: 2026-02-13T22:56:00Z
updated_at: 2026-02-15T08:07:42Z
parent: rocketbase-inji
---

Summary

Add Webfinger support to allow discovery of actors/accounts. Use fields from the PocketBase `metadata` table to provide properties such as `subject`, `aliases`, and `links` per RFC 7033.

Acceptance Criteria

- `/.well-known/webfinger` responds to queries like `?resource=acct:alice@example.com` with JSON per RFC7033
- Discovery uses PocketBase `metadata` collection to resolve account details

Tasks

- [ ] Implement `/.well-known/webfinger` route and query parsing
- [ ] Map PocketBase metadata fields to webfinger response fields
- [ ] Add tests for resolution and error cases
