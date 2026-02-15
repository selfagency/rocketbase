---
# rocketbase-er43
title: Add portfolio frontend display
status: in-progress
type: feature
priority: deferred
created_at: 2026-02-13T22:52:12Z
updated_at: 2026-02-15T20:17:05Z
parent: rocketbase-9bf3
---

Create public-facing portfolio page with grid/list views, filtering, and project detail pages.

## Progress Update

- Added public portfolio routes: `app/src/routes/portfolio/+page.server.ts`, `+page.svelte`, `[slug]/+page.server.ts`, `[slug]/+page.svelte`.
- Added portfolio UI components with microformats + JSON-LD: `app/src/lib/components/portfolio/*`.
- Added admin portfolio CRUD routes and UI scaffolding: `app/src/routes/admin/portfolio/**`, `app/src/lib/components/admin/portfolio/**`, `app/src/lib/utils/admin/portfolio-columns.ts`.
- Updated global nav to include admin portfolio links and quick create menu entry.
- Added fake data seed script: `app/util/generate-portfolio.js` and npm script `generate:portfolio`.
- Kept description/media separated on portfolio detail pages and admin forms (media managed independently).
- Validation: `pnpm test:node` passed; `pnpm check` passed with warning-only baseline outside this change set.



## Progress Update (2026-02-15)

- Fixed server-wide PocketBase response flattening bug in `app/src/lib/server/pocketbase.ts` where array responses (`getFullList`) were transformed into objects, causing `ClientResponseError 0` and 500s in `+layout.server.ts` and portfolio routes.
- Updated `afterSend` to handle three shapes safely: arrays, paginated list envelopes (`items`), and single records.
- Added regression test `app/src/tests/server/pocketbase.server.spec.ts` to ensure array/list flattening remains stable.
- Validation: `pnpm test:node` passed (61 files, 490 tests).
