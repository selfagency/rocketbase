---
# rocketbase-creq
title: 'FAQ: create PocketBase collection + migration + API rules'
status: in-progress
type: task
priority: critical
created_at: 2026-02-16T02:04:11Z
updated_at: 2026-02-16T02:11:31Z
parent: rocketbase-15d7
---

## Goal
Implement backend foundation for FAQs in PocketBase.

## Tasks
- [ ] Create `faqs` collection schema migration in `db/pb_migrations`
- [ ] Add fields: question, answer, slug, category, sort_order, is_published, locale
- [ ] Add indexes and sensible defaults for sorting/publishing
- [ ] Configure API rules (public read published only, admin-only write)
- [ ] Regenerate and verify TypeScript types

## Acceptance Criteria
- Migration applies cleanly
- Collection rules enforce public/admin boundaries
- Generated types include `faqs` and compile in app/db contexts
