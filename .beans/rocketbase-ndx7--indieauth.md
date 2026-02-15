---
# rocketbase-ndx7
title: Integrate IndieAuth opt-in for registered users
status: todo
type: task
priority: normal
created_at: 2026-02-13T22:56:00Z
updated_at: 2026-02-15T08:07:29Z
parent: rocketbase-inji
---

Summary

Enable IndieAuth for registered users who opt in. Implement the IndieAuth flow to allow users to use their account for delegated authentication and authorization with third-party apps.

Acceptance Criteria

- Users can opt-in to IndieAuth in their account settings
- Implement IndieAuth endpoints (`/auth`, `/token`, `/me` or follow the chosen library's recommended endpoints)
- Support PKCE and token issuance scoped to client apps

Tasks

- [ ] Research recommended Node/Svelte libraries (selfauth, or adapt examples)
- [ ] Add UI for opt-in and client management in account settings
- [ ] Implement token endpoint and scopes, securely store client registrations
- [ ] Add tests for flow and edge cases
