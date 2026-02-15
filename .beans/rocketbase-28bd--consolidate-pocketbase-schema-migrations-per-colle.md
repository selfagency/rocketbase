---
# rocketbase-28bd
title: Consolidate PocketBase schema migrations per collection
status: completed
type: task
priority: normal
created_at: 2026-02-15T16:04:03Z
updated_at: 2026-02-15T16:19:35Z
parent: rocketbase-56l8
---

Implement migration consolidation in db/pb_migrations to one schema migration per collection, remove superseded schema steps, preserve current collection IDs and relation integrity, and keep necessary data migrations separate.\n\n- [x] Audit final schema per collection and relation dependencies\n- [x] Create consolidated schema migrations (one per collection)\n- [x] Remove superseded schema migration files\n- [x] Preserve/verify data migrations and ordering\n- [x] Run migration/test verification and summarize changes

## Implementation Progress (Phase 1)\n\nGenerated non-destructive consolidated migration drafts from live schema into , including dependency-sorted ordering and a JSON report.\n\nAdded generator script: .\n\nNext phase is to replace active db/pb_migrations files with validated consolidated files, keep required data migrations, and run full verification.

## Summary of Changes

- Consolidated db/pb_migrations to one schema migration per collection (14 schema migrations).
- Removed superseded legacy schema and snapshot migrations from active db/pb_migrations.
- Preserved required data migrations as separate steps:
  - 1771043492_populate_default_metadata.js
  - 1771135570_snapshots_unique_editor_record.js
- Kept stable collection IDs and final naming (including portfolio).
- Verified final migration set and ordering in active folder: 16 files total (14 schema + 2 data).
- Performed JavaScript syntax parse verification for all migration files (16/16 passed).
- Kept generator and draft artifacts for reproducibility:
  - db/util/generate_consolidated_migrations.py
  - db/pb_migrations_consolidated/ with report and generated drafts.
