---
# rocketbase-k6xp
title: Default admin pages sorting to order descending
status: completed
type: task
priority: normal
created_at: 2026-02-14T20:40:30Z
updated_at: 2026-02-15T08:34:32Z
parent: rocketbase-iaak
---

Change admin pages table default sorting to page order descending and verify behavior/tests.

## Summary of Changes

- Changed admin pages default server sort from `-created` to `-order` in `app/src/routes/admin/pages/+page.server.ts`.
- Updated admin pages table sort indicator logic so when no `sort` query param is present, the `order` column shows descending as the default state.
