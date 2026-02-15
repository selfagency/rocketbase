---
# rocketbase-s6n6
title: Configure NYC coverage for Playwright e2e
status: completed
type: task
priority: normal
created_at: 2026-02-14T19:34:48Z
updated_at: 2026-02-15T08:34:32Z
parent: rocketbase-6qhb
---

Add nyc configuration and scripts to collect coverage when running e2e tests with Playwright.

## Summary of Changes
- Replaced Playwright project selector usage with browser selector in app package script.
- Updated test:e2e:coverage to use PLAYWRIGHT_COVERAGE=1 playwright test --browser=chromium.
- Confirmed workflow calls this script for e2e coverage artifacts.
