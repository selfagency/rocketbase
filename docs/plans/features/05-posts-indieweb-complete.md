# Posts + IndieWeb (Complete) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish the IndieWeb publishing surface for posts so published content is consistently discoverable, machine-readable, and ready for federation workflows.

**Architecture:** Keep SvelteKit routes as the rendering layer, PocketBase as source of truth, and add a thin server service layer for outbound/inbound IndieWeb tasks (webmentions/syndication bookkeeping).

**Tech Stack:** SvelteKit, PocketBase, Svelte 5, svelte-meta-tags, existing post routes/components, Vitest, Playwright.

---

## Overview

### User Stories

**As an editor, I want to:**

- Publish posts that always include complete microformats and structured metadata
- Track where a post was syndicated (if POSSE is used)
- Have outbound webmentions sent automatically to links in post content
- See inbound webmentions attached to each post (approved/spam/pending)

**As a reader or machine client, I want to:**

- Parse consistent `h-entry`/`h-card` data on post pages and listings
- Discover canonical URLs and feed links reliably
- Access post pages that preserve semantic author/date/tag relationships

### Current State

- Post pages already include OpenGraph + JSON-LD (`BlogPosting`) and some IndieWeb markup.
- Microformats work has been partially completed in prior beans.
- Feed endpoints exist and are linked in layout.
- Dedicated webmention receive/store workflow is not finalized for Phase 0 completion.
- Syndication bookkeeping (per-post destinations/URLs/status) is not fully defined.

### Success Criteria

- ✅ Every post detail page renders valid and complete `h-entry` + author `h-card`
- ✅ Post listing/cards keep compatible IndieWeb summary markup (`h-feed`/`h-entry` as applicable)
- ✅ Canonical URL, publish/updated timestamps, categories, and author references are consistently exposed
- ✅ Outbound webmention sending pipeline exists for newly published/updated posts
- ✅ Inbound webmentions are persisted and can be rendered on post pages
- ✅ Admin/editor can review webmention moderation state
- ✅ Unit + integration + e2e coverage exists for critical workflows

---

## Scope and Boundaries

### In Scope (Phase 0)

- Harden post-page IndieWeb semantics and metadata consistency.
- Webmention receive + store + render for posts.
- Outbound webmention send queue/task integration.
- Post-level syndication status model and UI hooks in admin post form.

### Out of Scope (defer)

- Full ActivityPub server implementation
- IndieAuth provider flow
- Complex moderation analytics/dashboarding

---

## Research Phase

### Task 1: Baseline Existing IndieWeb Markup

1. Review `app/src/routes/posts/[slug]/+page.svelte` and related post card/header components.
2. Verify current classes/properties (`h-entry`, `p-name`, `e-content`, `dt-published`, `u-url`, `p-category`, `h-card`).
3. Document gaps in `docs/research/posts-indieweb-baseline.md`.

### Task 2: Webmention Workflow Design

1. Define endpoint contract for receiving mentions (`/webmention` or equivalent route).
2. Define verification flow (source fetch, target match, idempotency).
3. Define moderation statuses (`pending`, `approved`, `rejected`, `spam`).
4. Document in `docs/research/webmention-flow.md`.

### Task 3: Data Model Decisions

1. Confirm whether to use an existing collection or add `webmentions` collection.
2. Define post fields for syndication bookkeeping (e.g., `syndication_targets`, `syndication_urls`, `syndication_state`).
3. Add migration plan notes in `docs/research/posts-indieweb-data-model.md`.

---

## Development Phase

### Task 4: Semantic Markup Hardening

**Target files:**

- `app/src/routes/posts/[slug]/+page.svelte`
- post listing/card components used in `/posts` and home highlights

**Deliverables:**

- Consistent post container semantics
  - Explicit mapping for:
    - `p-name` (title)
    - `dt-published` + `dt-updated`
    - `e-content` (post body)
    - `u-url` (canonical)
    - `p-category` tags
    - author `h-card`

### Task 5: Webmention Inbound

**Target files (planned):**

- new route handler for receiving webmentions
- post page server load to fetch approved mentions

**Deliverables:**

- Validated inbound storage with duplicate protection
- Mention moderation status field
- Safe rendering on post detail page (sanitized excerpts, attribution)

### Task 6: Webmention Outbound

**Target files (planned):**

- server-side publish/update pipeline for posts
- queue integration in sidecar (if async)

**Deliverables:**

- On publish/update, extract links from post content
- Discover webmention endpoints and enqueue send attempts
- Persist send result by target URL

### Task 7: Syndication Bookkeeping

**Target files (planned):**

- post schema/types
- admin post form UI + server action

**Deliverables:**

- Per-post list of syndication destinations and resulting URL(s)
- Visible state for success/failure/pending

---

## Testing Phase

### Unit Tests

- HTML/link extraction for outbound mentions
- Mention endpoint discovery helpers
- Idempotency checks for duplicate mention submissions

### Integration Tests

- Receive mention → verify → persist status transitions
- Publish post → enqueue outbound mentions

### E2E Tests

- Admin publishes post with external links; mention jobs created
- Reader sees approved webmentions on post page
- Microformat snapshot/assertion for post detail structure

### Accessibility Checks

- Ensure mention list items expose meaningful link labels
- Ensure timestamp and author info are available to assistive tech

---

## Risks and Mitigations

- **Risk:** SSRF risk while verifying mention sources.
  - **Mitigation:** Strict URL validation, block private IP ranges, timeout + size caps.
- **Risk:** Spam/fake mentions.
  - **Mitigation:** Verification + moderation state defaults to `pending`.
- **Risk:** Regressions in post rendering semantics.
  - **Mitigation:** Snapshot tests for key markup and regression checks in e2e.

---

## Completion Checklist

- [ ] Baseline audit documented
- [ ] Semantic markup consistency complete
- [ ] Inbound webmention route + persistence complete
- [ ] Outbound mention sending wired into publish/update flow
- [ ] Syndication bookkeeping fields/UI complete
- [ ] Unit/integration/e2e tests passing
- [ ] Security checks added for mention verification fetches
- [ ] User/admin documentation updated

---

## Follow-Up (Post-Phase 0)

- Expand to ActivityPub interoperability
- IndieAuth identity workflows
- Mention analytics dashboard (volume, source domains, approval rates)
