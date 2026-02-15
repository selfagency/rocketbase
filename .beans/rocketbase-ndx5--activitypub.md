---
# rocketbase-ndx5
title: Integrate ActivityPub for posts
status: todo
type: task
priority: normal
created_at: 2026-02-13T22:56:00Z
updated_at: 2026-02-15T08:07:26Z
parent: rocketbase-inji
---

Summary

Add ActivityPub support to syndicate `posts` as an Actor and deliver activities to followers/other servers. Follow ActivityPub specs and reference guides (activitypub.rocks, ap-next) to implement an inbox/outbox, actor representation, and federation logic.

Acceptance Criteria

- Expose an Actor for the site (e.g., `/users/<handle>`) with correct JSON-LD
- Implement `inbox` and `outbox` endpoints for receiving and sending activities
- Allow publishing posts as Create activities and persist remote follow relationships

Tasks

- [ ] Design Actor representation and map `posts` to ActivityPub objects
- [ ] Implement `/users/:handle`, `/users/:handle/inbox`, `/users/:handle/outbox` endpoints
- [ ] Handle signature verification (HTTP Signatures) and delivery retries
- [ ] Add tests for basic federation (send/receive activities locally)
