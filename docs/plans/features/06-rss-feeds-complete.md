# RSS + JSON Feeds (Complete) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete and harden the existing `/feed/rss` and `/feed/json` endpoints so they are spec-aligned, metadata-driven, and production-observable.

**Architecture:** Keep the current route handlers, extract shared feed mapping utilities, and expand validation/testing to prevent regressions.

**Tech Stack:** SvelteKit, PocketBase, existing feed routes, Vitest, Playwright.

---

## Overview

### User Stories

**As a reader/feed consumer, I want to:**

- Access valid RSS and JSON feeds with consistent post metadata
- See accurate publish dates, authors, categories, and canonical URLs
- Receive stable feed output with predictable caching behavior

**As an admin/editor, I want to:**

- Have feed title/description driven by site metadata, not hardcoded text
- Include optional enclosures/media where available
- Trust that feed output remains valid after post model changes

### Current State

- `/feed/rss` and `/feed/json` routes already exist.
- Alternate feed links are already present in layout metadata.
- Unit tests already cover many happy-path and error scenarios.
- Remaining completion gaps for Phase 0:
  - strict spec validation tests (external validators)
  - metadata-driven feed identity (site title/description/image)
  - shared feed mapper to reduce duplication and drift
  - enclosure/media handling from post fields

### Success Criteria

- ✅ Feed metadata (title/description/home/feed URLs) sourced from metadata collection fallback chain
- ✅ RSS output remains valid RSS 2.0 and JSON output remains JSON Feed 1.1
- ✅ Optional media/enclosure support implemented where post fields exist
- ✅ Shared server mapping utility used by both feed endpoints
- ✅ Validation tests include spec-level checks and schema assertions
- ✅ Caching and error headers are explicit and tested

---

## Scope and Boundaries

### In Scope (Phase 0)

- Harden existing feed endpoints and tests
- Add feed generation abstraction for consistency
- Add validation-focused tests and fixtures
- Improve feed metadata sourcing and optional enrichments

### Out of Scope (defer)

- Full Atom feed endpoint
- Subscriber-only personalized feeds
- Real-time push syndication protocols

---

## Research Phase

### Task 1: Feed Spec Cross-Check

1. Verify current RSS route output against RSS 2.0 requirements.
2. Verify current JSON route output against JSON Feed 1.1 requirements.
3. Document mandatory/optional fields and repo mapping in `docs/research/feed-spec-mapping.md`.

### Task 2: Metadata Source Design

1. Identify metadata keys for feed identity (`site_title`, `site_description`, `og_image`, possibly author/site links).
2. Define fallback behavior when metadata is missing.
3. Document in `docs/research/feed-metadata-fallbacks.md`.

### Task 3: Enclosure/Media Mapping

1. Review post schema fields (`enclosure`, attachments/media relationships).
2. Define RSS `<enclosure>` and JSON feed attachment mapping rules.
3. Document in `docs/research/feed-enclosures.md`.

---

## Development Phase

### Task 4: Shared Feed Mapping Utility

**Planned outputs:**

- shared server utility for post → feed item mapping
- consistent author/tag/date normalization rules used by both endpoints

**Acceptance for task:**

- no duplicated mapping logic between RSS and JSON routes
- existing endpoint behavior preserved for covered tests

### Task 5: Metadata-Driven Feed Identity

**Target behavior:**

- feed title/description sourced from site metadata first
- fallback to safe defaults when metadata records are missing
- canonical base URL from request origin remains authoritative

### Task 6: Enclosure + Attachments

**Target behavior:**

- include RSS `<enclosure>` when post provides valid enclosure URL
- include JSON feed `attachments` objects where possible
- gracefully skip invalid URLs instead of failing whole feed

### Task 7: Header and Error Hardening

**Target behavior:**

- explicit `Content-Type` and cache headers on success
- deterministic 5xx body formats for each feed type
- structured error logging with enough context for debugging

---

## Testing Phase

### Unit + Integration Tests

- mapper tests for author/date/tag normalization
- metadata fallback tests for title/description
- enclosure mapping tests (valid/invalid URL cases)
- error-path tests for PocketBase fetch failures

### Spec Validation Tests

- RSS XML validation test using parser/validator tooling
- JSON Feed structure validation against known schema/assertions
- regression fixtures for edge characters and CDATA behavior

### E2E Smoke

- `/feed/rss` and `/feed/json` return 200 in running app
- alternate links in layout point to working endpoints

---

## Risks and Mitigations

- **Risk:** Feed regressions when post schema evolves.
  - **Mitigation:** Shared mapper + strict tests covering schema edge cases.
- **Risk:** Invalid user data breaks feed generation.
  - **Mitigation:** Defensive normalization and per-item fallback behavior.
- **Risk:** Cache behavior mismatch in deployment environments.
  - **Mitigation:** Header tests plus deployment docs for CDN overrides.

---

## Completion Checklist

- [ ] Spec mapping docs complete
- [ ] Shared mapping utility implemented
- [ ] Metadata-driven feed identity implemented
- [ ] Enclosure/attachment support implemented
- [ ] Header + error behavior standardized
- [ ] Validation tests (RSS + JSON) passing
- [ ] E2E feed smoke tests passing
- [ ] Documentation updated

---

## Follow-Up (Post-Phase 0)

- Add Atom endpoint if needed by downstream consumers
- Add filtered feeds (tag/category/author)
- Add signed/private feeds for subscription tiers
