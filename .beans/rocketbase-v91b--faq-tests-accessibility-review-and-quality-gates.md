---
# rocketbase-v91b
title: 'FAQ: tests, accessibility review, and quality gates'
status: todo
type: task
priority: critical
created_at: 2026-02-16T02:04:27Z
updated_at: 2026-02-16T02:11:31Z
parent: rocketbase-15d7
blocked_by:
    - rocketbase-z8aw
    - rocketbase-dv8a
---

## Goal
Verify FAQ feature quality and prevent regressions.

## Tasks
- [ ] Add/extend unit tests for FAQ validation and server helpers
- [ ] Add route/action tests for publishing and admin authorization rules
- [ ] Add Playwright coverage for public FAQ rendering and admin CRUD happy path
- [ ] Run lint, type checks, and test suites for touched packages
- [ ] Perform manual accessibility sanity pass and capture follow-ups

## Acceptance Criteria
- Relevant tests pass locally
- No critical accessibility regressions found
- Quality gates pass for changed areas
