---
# rocketbase-v1um
title: Add portfolio admin interface
status: in-progress
type: feature
priority: deferred
created_at: 2026-02-13T22:52:11Z
updated_at: 2026-02-15T17:16:35Z
parent: rocketbase-9bf3
---

Create admin UI for managing portfolio items (CRUD operations, image uploads, ordering).

## Progress Update

- Added admin portfolio list/new/edit server and page routes under `app/src/routes/admin/portfolio/**`.
- Added reusable admin portfolio components and table columns under `app/src/lib/components/admin/portfolio/**` and `app/src/lib/utils/admin/portfolio-columns.ts`.
- Implemented media upload flow to `media` collection and relation assignment on `portfolio` records for create/edit.
- Added nav integration for admin portfolio and quick create action.
- Added seed utility `app/util/generate-portfolio.js` for local fake portfolio population.
- Validation: `pnpm test:node` passed; `pnpm check` passed with warning-only baseline outside this change set.
