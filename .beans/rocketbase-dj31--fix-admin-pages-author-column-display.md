---
# rocketbase-dj31
title: Fix admin pages author column display
status: in-progress
type: bug
priority: high
created_at: 2026-02-14T04:09:42Z
updated_at: 2026-02-14T04:09:42Z
---

The admin pages table is missing the author field in the rows being passed to columns.ts. Need to investigate the data loading in +page.server.ts to ensure author relation is properly expanded.
