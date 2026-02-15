---
# rocketbase-a86b
title: Handle underscore-prefixed auto collections in consolidated migrations
status: completed
type: bug
priority: normal
created_at: 2026-02-15T16:24:28Z
updated_at: 2026-02-15T16:25:10Z
---

Ensure consolidated migration upsert logic checks collection by id and by name to avoid create attempts for auto-generated underscore/system collections.

## Summary of Changes

- Updated consolidated migration template to lookup collections by id first, then by name.
- This prevents recreate attempts for auto-generated/system collections whose ids may be underscore-prefixed or otherwise reserved.
- Regenerated consolidated migration files and synced them to active db/pb_migrations.
- Verified generated files parse and include fallback behavior.
