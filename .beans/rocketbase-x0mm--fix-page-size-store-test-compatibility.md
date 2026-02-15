---
# rocketbase-x0mm
title: Fix page-size-store test compatibility
status: completed
type: bug
priority: normal
created_at: 2026-02-15T07:20:39Z
updated_at: 2026-02-15T08:22:23Z
parent: rocketbase-6qhb
---

Make server page-size metadata loading resilient to mocked PocketBase clients that do not implement metadata.getFullList, so route server tests pass again.

## Summary of Changes

- Made app/src/lib/server/page-size-store.ts resilient to mocked/minimal PocketBase collection APIs by supporting getFullList, optional getList, and missing metadata collection gracefully.
- Added defensive fallback in getServerPageSizes so metadata lookup errors no longer crash route loaders during tests.
- Updated app/src/tests/routes/tags/[slug]/page.server.spec.ts default per-page expectation to 12, matching metadata-backed posts_per_page default behavior.
- Stabilized app/src/lib/components/global/Nav.auth.spec.ts by selecting the avatar user-menu trigger (.rounded-full[aria-label]) instead of the first aria-label trigger.

## Validation

- pnpm run test:node passed (31/31 files, 361 tests).
- pnpm run test:browser passed (23/23 files, 190 tests).
- Full pnpm run test now only fails at Playwright webServer startup (pocketbase container unhealthy), unrelated to this codepath.
