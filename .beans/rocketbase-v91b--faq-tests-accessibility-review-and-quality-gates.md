---
# rocketbase-v91b
title: 'FAQ: tests, accessibility review, and quality gates'
status: completed
type: task
priority: critical
created_at: 2026-02-16T02:04:27Z
updated_at: 2026-02-16T04:39:19Z
parent: rocketbase-15d7
blocked_by:
    - rocketbase-z8aw
    - rocketbase-dv8a
---

## Goal
Verify FAQ feature quality and prevent regressions.

## Tasks
- [x] Add/extend unit tests for FAQ validation and server helpers
- [x] Add route/action tests for publishing and admin authorization rules
- [x] Add Playwright coverage for public FAQ rendering and admin CRUD happy path
- [x] Run lint, type checks, and test suites for touched packages
- [x] Perform manual accessibility sanity pass and capture follow-ups (keyboard disclosure/labels/alerts checked; no critical issues found in FAQ flows)

## Acceptance Criteria
- Relevant tests pass locally
- No critical accessibility regressions found
- Quality gates pass for changed areas

## Summary of Changes

- Hardened FAQ Playwright auth helper with retries and better diagnostics for transient startup responses.
- Stabilized FAQ E2E assertions by scoping to the created FAQ article and asserting UI outcomes.
- Verified FAQ E2E coverage passes locally on app/src/tests/e2e/faqs.test.ts (2 passed).
- Completed a manual accessibility sanity pass for FAQ public/admin flows (keyboard interaction and form labeling).
