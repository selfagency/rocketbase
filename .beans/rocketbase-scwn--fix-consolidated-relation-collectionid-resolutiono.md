---
# rocketbase-scwn
title: Fix consolidated relation collectionId resolution/order
status: completed
type: bug
priority: normal
created_at: 2026-02-15T16:28:09Z
updated_at: 2026-02-15T16:29:39Z
parent: rocketbase-56l8
---

Resolve migration failures in consolidated pages migration where relation collectionId doesn't exist by correcting generator relation-id handling and migration ordering.

## Summary of Changes

- Root cause found: `pages.parent` is a self-relation and fails when included during initial collection create.
- Updated generator to emit two-phase create for collections with self-relations:
  1) create collection without self-relation fields
  2) apply full schema with `unmarshal(collectionUpdateData, collection)` and save again
- Regenerated and synced consolidated migrations.
- Verified `1770001100_consolidated_pages.js` includes `collectionCreateData` and follow-up unmarshal update.
