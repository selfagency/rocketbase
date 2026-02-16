---
# rocketbase-creq
title: "FAQ: create PocketBase collection + migration + API rules"
status: completed
type: task
priority: critical
created_at: 2026-02-16T02:04:11Z
updated_at: 2026-02-16T02:11:31Z
parent: rocketbase-15d7
---

## Goal

Implement backend foundation for FAQs in PocketBase.

## Tasks

- [x] Create `faqs` collection schema migration in `db/pb_migrations`
- [x] Add fields: question, answer, slug, category, sort_order, is_published, locale
- [x] Add indexes and sensible defaults for sorting/publishing
- [x] Configure API rules (public read published only, admin-only write)
- [x] Regenerate and verify TypeScript types

## Acceptance Criteria

- Migration applies cleanly
- Collection rules enforce public/admin boundaries
- Generated types include `faqs` and compile in app/db contexts

## Summary of Changes

- Added FAQ migration at `db/pb_migrations/1771206000_create_faqs_collection.js` with fields, API rules, and indexes.
- Applied migration successfully in the running PocketBase container.
- Regenerated `app/src/lib/types/pocketbase.d.ts` to include `faqs` collection types.
- Verified checks pass in this workspace: `pnpm -C db run check` and `pnpm -C app run check`.
