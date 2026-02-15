---
# rocketbase-ndx4
title: Integrate Webmentions for posts
status: todo
type: task
priority: normal
created_at: 2026-02-13T22:56:00Z
updated_at: 2026-02-15T08:05:55Z
parent: rocketbase-inji
---

Summary

Add Webmention support for the `posts` collection so the site can receive and display mentions from other sites. Follow common patterns and reference guides (Jan Monschke, rknight) for sending/receiving and verification.

Acceptance Criteria

- The site exposes a Webmention endpoint to receive mentions (e.g., `/webmention`) and validates incoming mentions
- Mentions are stored in a `webmentions` collection and associated with posts
- Mentions are displayed on the post page in a chronological list with attribution

Tasks

- [ ] Implement a POST endpoint to receive webmentions and validate source/target
- [ ] Store accepted mentions in PocketBase `webmentions` collection
- [ ] Update post pages UI to render mentions and counts
- [ ] Add tests for verification logic and storage

Notes

- Use existing Mailpit/test infra to simulate external sites in tests.
