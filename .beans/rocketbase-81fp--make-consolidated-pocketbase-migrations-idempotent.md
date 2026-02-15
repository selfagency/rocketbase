---
# rocketbase-81fp
title: Make consolidated PocketBase migrations idempotent
status: completed
type: bug
priority: normal
created_at: 2026-02-15T16:22:04Z
updated_at: 2026-02-15T16:23:50Z
---

Fix migration failures like 1770001040_consolidated_users.js where collection id/name already exists by making consolidated schema migrations safe to run against existing dev DB state.

## Summary of Changes

- Updated consolidated migration generation to be idempotent: update existing collection when found, otherwise create it.
- Added safe rollback behavior to no-op when collection is already absent.
- Regenerated consolidated migration files and synced them into active db/pb_migrations.
- Verified JavaScript syntax for all 14 consolidated migration files.
- This resolves failures where model id/name already exists during migration apply.
