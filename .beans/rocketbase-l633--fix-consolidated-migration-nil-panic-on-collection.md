---
# rocketbase-l633
title: Fix consolidated migration nil panic on collection update
status: completed
type: bug
priority: normal
created_at: 2026-02-15T16:26:05Z
updated_at: 2026-02-15T16:26:30Z
---

Use unmarshal-based update in generated consolidated migrations instead of direct field assignment, preventing nil pointer panic in core.FieldsList.add during app.save(collection).

## Summary of Changes

- Identified root cause of panic: generated update path directly assigned `collection.fields`, producing invalid field list state in PocketBase.
- Updated generator to use `unmarshal(collectionUpdateData, collection)` for existing-collection updates.
- Preserved id/name lookup fallback for auto-generated/system collections.
- Regenerated and synced all 14 consolidated migrations and validated syntax.
