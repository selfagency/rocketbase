# Short Links Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Provide branded short URLs with redirect analytics for campaigns and post distribution.

## Overview

### User Stories

- Editors can generate short links for posts and campaigns.
- Readers are redirected quickly and reliably.
- Admins can inspect click counts and referrer trends.

### Success Criteria

- ✅ Short-link create/manage UI
- ✅ Fast redirect endpoint with caching
- ✅ Click event tracking and daily aggregates
- ✅ Expiry and custom slug support

## Scope

### In Scope

- Single-domain short links
- Basic analytics (total clicks, top referrers, time series)

### Out of Scope

- Multi-domain link routing
- Fraud/abuse detection beyond basics

## Research Phase

1. Review existing `redirects` collection overlap.
2. Define slug generation and uniqueness policy.
3. Define privacy-safe analytics fields.

## Development Phase

1. Add short-link schema and click-event capture.
2. Implement short redirect route with logging.
3. Build admin management and analytics views.
4. Add custom slug + expiration handling.

## Testing Phase

- Unit: slug generation and validation
- Integration: redirect + click log write path
- E2E: create short link and verify redirect

## Documentation

- `docs/user-guide/short-links.md`
- analytics data-retention notes

## Completion Checklist

- [ ] schema + redirect route complete
- [ ] analytics capture complete
- [ ] admin UI complete
- [ ] tests passing
- [ ] docs updated
