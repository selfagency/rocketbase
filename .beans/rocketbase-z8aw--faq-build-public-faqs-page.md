---
# rocketbase-z8aw
title: 'FAQ: build public /faqs page'
status: in-progress
type: task
priority: critical
created_at: 2026-02-16T02:04:16Z
updated_at: 2026-02-16T02:22:29Z
parent: rocketbase-15d7
blocked_by:
    - rocketbase-creq
---

## Goal
Ship a public FAQs page backed by published records.

## Tasks
- [ ] Add `app/src/routes/faqs/+page.server.ts` to fetch published FAQs
- [ ] Add `app/src/routes/faqs/+page.svelte` UI with semantic headings and accessible expand/collapse
- [ ] Apply stable sorting (`sort_order`, then created fallback)
- [ ] Add empty/error states
- [ ] Add SEO metadata/title integration

## Acceptance Criteria
- `/faqs` renders published FAQs only
- Keyboard and screen-reader behavior is usable
- Empty and error states are graceful
