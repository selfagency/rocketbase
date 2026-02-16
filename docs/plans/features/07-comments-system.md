# Comments System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a secure, accessible comment system with moderation for posts.

## Overview

### User Stories

- Readers can post comments on published posts.
- Editors/admins can moderate, approve, reject, and mark spam.
- Authors can optionally disable comments per post.

### Success Criteria

- ✅ Comment CRUD (create/read/moderate/delete)
- ✅ Moderation workflow (`pending`, `approved`, `rejected`, `spam`)
- ✅ Rate limiting + anti-spam basics
- ✅ Accessible UI and keyboard support
- ✅ Unit/integration/e2e coverage

## Scope and Boundaries

### In Scope

- Post-level comments
- Moderation queue in admin
- Thread depth limit (single-level replies max)

### Out of Scope

- Real-time websocket chat semantics
- Third-party comment providers

## Research Phase

1. Audit post page rendering and server actions.
2. Define comment schema and indexes (post, status, created).
3. Review anti-spam options (honeypot, rate limits, simple heuristics).

## Development Phase

1. Add `comments` collection migration and TS types.
2. Implement public create action with validation.
3. Implement admin moderation routes/actions.
4. Render approved comments on post pages.
5. Add per-post comment toggle in post form.

## Testing Phase

- Unit: validators, moderation transitions
- Integration: create comment + moderation transitions
- E2E: submit comment, approve in admin, verify on post page
- Security: rate limit and spam guard checks

## Documentation

- `docs/user-guide/comments.md`
- moderation runbook for admins

## Completion Checklist

- [ ] schema + migrations complete
- [ ] public submission and admin moderation complete
- [ ] anti-spam/rate-limit protections added
- [ ] tests passing
- [ ] docs updated
