---
# rocketbase-b2cm
title: Load page sizes from metadata
status: completed
type: task
priority: normal
created_at: 2026-02-15T03:01:34Z
updated_at: 2026-02-15T08:34:32Z
parent: rocketbase-yu99
---

Read metadata keys admin_posts_per_page and posts_per_page, place values in a server-side Svelte store, and use store values to drive page-size in requests.

Summary: Added server-side page-size store in app/src/lib/server/page-size-store.ts that reads metadata keys admin_posts_per_page and posts_per_page, then wired admin/posts, posts, tags/[slug], and authors/[id] loaders to use those store values as perPage defaults (query param still overrides). Validation: pnpm check in app passed with 0 errors/warnings.

## Summary of Changes: Added server-side page-size store in app/src/lib/server/page-size-store.ts reading metadata keys admin_posts_per_page and posts_per_page; wired admin/posts, posts, tags/[slug], and authors/[id] loaders to use store-derived perPage defaults while preserving query-param overrides. Validation: pnpm check (app) passed with 0 errors and 0 warnings.
