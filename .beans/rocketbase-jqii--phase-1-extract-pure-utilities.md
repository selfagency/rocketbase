---
# rocketbase-jqii
title: 'Phase 1: Extract pure utilities'
status: completed
type: task
priority: normal
created_at: 2026-02-15T08:02:03Z
updated_at: 2026-02-15T08:31:10Z
parent: rocketbase-gw8p
---

Tasks 1.1-1.7 from docs/plans/2026-02-15-codebase-refactoring-test-coverage.md

- [x] 1.1 Extract HTML syntax highlighter from tipex-editor
- [x] 1.2 Extract attribution builder from tipex-editor
- [x] 1.3 Extract snapshot serializer from editor-session-guard
- [x] 1.4 Add tests for relative-time.ts
- [x] 1.5 Add tests for slug-utils.ts
- [x] 1.6 Add tests for image-sizes.ts
- [x] 1.7 Add tests for page.ts and post.ts schemas

## Summary of Changes\n\n- Extracted pure utilities from editor components:\n  - app/src/lib/utils/html-highlighter.ts\n  - app/src/lib/utils/media-attribution.ts\n  - app/src/lib/utils/snapshot-serializer.ts\n- Refactored consumers to use shared utilities:\n  - app/src/lib/components/ui/tipex-editor.svelte\n  - app/src/lib/components/admin/editor-session-guard.svelte\n  - app/src/lib/components/admin/pages/page-form.svelte\n  - app/src/lib/components/admin/posts/post-form.svelte\n- Added comprehensive utility/schema test coverage for Phase 1:\n  - html-highlighter, media-attribution, snapshot-serializer\n  - relative-time, slug-utils, image-sizes\n  - page schema and post schema\n- Verification:\n  - pnpm lint (warnings only, no errors)\n  - pnpm test:node (all passing)\n  - pnpm test:browser (all passing)\n  - pnpm build (success)
