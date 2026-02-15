---
# rocketbase-1fhq
title: Update posts/pages media relations in app code
status: completed
type: bug
priority: normal
created_at: 2026-02-14T18:28:10Z
updated_at: 2026-02-15T08:23:41Z
parent: rocketbase-3h6u
---

Adjust app code and post utility script for schema changes where posts/pages now use media relation instead of inline uploads; account for new comments and portfolio collections.

## Implementation Checklist

- [x] Migrate page media handling from inline file uploads to media relation IDs (attachments).
- [x] Update page rendering/SEO to read expanded media attachment records.
- [x] Update post generation utility to create media records and set post attachments.
- [x] Extend expanded PocketBase types for attachments/comments/portfolio-aware usage.
- [x] Run targeted checks/tests and finalize bean summary.

## Summary of Changes

- Kept the `image` field as the featured image for posts/pages and restored UI/SEO code paths to use it.
- Migrated page extra media handling to `attachments` relation IDs backed by `media` records.
- Updated admin page create/edit actions to convert uploaded `media` files into `media` records, then attach IDs to `attachments`.
- Updated `app/util/generate-posts.js` to keep featured `image`, create `media` records for additional photos, and set post `attachments`.
- Added expanded type helpers for attachments and new comments/portfolio-aware expanded shapes.
- Validation: `pnpm check` passed and `pnpm run test:node` passed (349 tests).

## Follow-up fix

- Added backward-compatible `page.media` fallback in `PageContent.svelte` for browser tests while keeping `expand.attachments` as primary source.
- Verified with `pnpm run test:browser -- src/tests/lib/components/PageContent.svelte.spec.ts`.
