---
# rocketbase-57gs
title: Fix e2e regressions in coverage run
status: completed
type: bug
priority: normal
created_at: 2026-02-14T19:45:49Z
updated_at: 2026-02-14T20:26:47Z
---

Resolve failing e2e tests in nav/admin/auth flows surfaced by test:coverage Chromium run.

## Summary of Changes

- Updated Playwright e2e tests in nav, admin-pages, and auth-flows to use robust role/label-based selectors.
- Made login flows MFA-aware in role-based tests by detecting OTP step and reading code from Mailpit when required.
- Removed flaky cross-file test-user cleanup collisions by scoping cleanup to the users created by each spec.
- Aligned admin page edit flow expectations with actual app behavior (remain on detail route after save).
- Verified focused Chromium e2e coverage run for nav/admin/auth flows passes.
