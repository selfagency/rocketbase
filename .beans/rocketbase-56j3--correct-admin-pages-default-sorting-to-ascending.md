---
# rocketbase-56j3
title: Correct admin pages default sorting to ascending
status: completed
type: task
priority: normal
created_at: 2026-02-14T20:41:39Z
updated_at: 2026-02-14T20:42:03Z
---

Follow-up correction: admin pages table default should be page order ascending, not descending. Update server default sort and table default sort indicator state.

## Summary of Changes

- Updated admin pages server default sort to ascending page order (`sort = "order"`).
- Updated admin pages table default sort indicator state (when no sort query param is set) to ascending for the order column.
