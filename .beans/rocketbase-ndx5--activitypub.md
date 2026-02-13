---
title: "Integrate ActivityPub for posts"
type: task
status: todo
priority: normal
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
