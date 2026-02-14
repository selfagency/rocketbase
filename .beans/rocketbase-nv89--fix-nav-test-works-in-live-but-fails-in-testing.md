---
# rocketbase-nv89
title: Fix nav test - works in live but fails in testing
status: todo
type: bug
priority: low
created_at: 2026-02-14T02:15:30Z
updated_at: 2026-02-14T02:15:30Z
---

The navigation test for admin dropdown menu works correctly on the live website but fails in the Playwright E2E test environment.

## Test Info

File: `app/src/tests/e2e/nav.test.ts`
Test: "shows Admin dropdown next to About for admin/editor/contributor and Pages only for admin/editor"

## Issue

The test expects the Admin dropdown to be the last item in the navigation, which is true on the live site, but the test environment may have different navigation structure or timing issues.

## Investigation Needed

- Check if there are timing/race conditions in the test
- Verify navigation rendering is complete before assertions
- Check if test environment navigation differs from production
- Consider if there are additional nav items in test that aren't in production
- May need to wait for navigation to stabilize before checking positions

## Possible Solutions

- Add explicit wait for navigation to be fully rendered
- Use more flexible locator strategies
- Check for specific navigation items rather than position-based assertions
- Add debug logging to see actual nav structure in test environment
