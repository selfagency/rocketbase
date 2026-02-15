---
# rocketbase-wedt
title: "Phase 3: Deduplicate admin forms"
status: completed
type: task
priority: normal
created_at: 2026-02-15T08:02:04Z
updated_at: 2026-02-15T08:45:19Z
parent: rocketbase-gw8p
---

Tasks 3.1-3.6 from plan

## Checklist

- [x] 3.1 Extract shared form snapshot/draft identity helpers and refactor page/post forms
- [x] 3.2 Extract shared table/column utility logic
- [x] 3.3 Add tests for extracted table utilities
- [x] 3.4 Validate admin pages/posts table behavior after refactor
- [x] 3.5 Run targeted + broader regression tests
- [x] 3.6 Document outcomes and finalize phase

## Notes

- Added shared admin table utilities and refactored pages/posts data tables to consume them.
- Utility suites pass (`form-snapshot-utils`, `data-table-utils`).
- Broader regression pass completed via `pnpm test:node` and `pnpm test:browser`.
- Full aggregated test command includes E2E startup and failed here due webServer boot error in this environment.

## Summary of Changes

- Added shared admin form snapshot utilities and refactored page/post forms to use them.
- Added shared admin data-table utilities and refactored pages/posts data tables to use shared visibility, sort-state, and class helpers.
- Added dedicated utility tests for both new shared modules.
- Verified with targeted utility tests and broader app node/browser suites.
