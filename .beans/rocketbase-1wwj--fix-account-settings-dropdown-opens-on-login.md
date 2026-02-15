---
# rocketbase-1wwj
title: Fix account settings dropdown opens on login
status: completed
type: bug
priority: normal
created_at: 2026-02-14T20:39:23Z
updated_at: 2026-02-15T08:21:48Z
parent: rocketbase-90wn
---

Account settings dropdown appears open immediately after login. Investigate nav/account menu state initialization and ensure it remains closed until explicit user interaction.

## Summary of Changes

- Removed forced mounting and controlled open-state wiring from the account dropdown in global nav so it remains closed by default after login and only opens via user interaction.
