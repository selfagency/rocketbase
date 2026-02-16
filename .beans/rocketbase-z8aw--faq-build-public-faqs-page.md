---
# rocketbase-z8aw
title: "FAQ: build public /faqs page"
status: completed
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

- [x] Add `app/src/routes/faqs/+page.server.ts` to fetch published FAQs
- [x] Add `app/src/routes/faqs/+page.svelte` UI with semantic headings and accessible expand/collapse
- [x] Apply stable sorting (`sort_order`, then created fallback)
- [x] Add empty/error states
- [x] Add SEO metadata/title integration

## Acceptance Criteria

## Summary of Changes

Implemented public `/faqs` route with published-only fetch, stable `sort_order` then `created` sorting, and graceful empty/error states. Added accessible disclosure UI using semantic headings and native `details/summary`, integrated SEO metadata tags, and added a fallback `FAQs` top-level nav link when no CMS page slug is `faqs`. Verified with `pnpm -C app run check` (0 errors, 1 pre-existing warning).
