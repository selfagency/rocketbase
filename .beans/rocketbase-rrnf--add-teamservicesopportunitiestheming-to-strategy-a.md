---
# rocketbase-rrnf
title: Add team/services/opportunities/theming to strategy and issue plan
status: completed
type: task
priority: normal
created_at: 2026-02-16T01:56:58Z
updated_at: 2026-02-16T01:59:02Z
---

Update the master implementation strategy and create beans for: team collection + admin page, services collection + admin page, opportunities collection + admin page (employment/internship/volunteer), and UI theming system for site color customization.

- [x] Update master implementation plan with new features
- [x] Create ADMIN feature beans for Team, Services, Opportunities
- [x] Create UI feature bean for Theming system
- [x] Link new beans to epics and summarize

## Summary of Changes

- Updated `docs/plans/2026-02-15-master-implementation-plan.md` to include Team, Services, Opportunities, and UI Theming in the strategy (Not Started list, Phase 0 table, planned additions, and success metrics).
- Created and linked new ADMIN feature beans under epic `rocketbase-alnr`:
  - `rocketbase-xedy` (Team collection + admin page)
  - `rocketbase-1pj3` (Services collection + admin page)
  - `rocketbase-f83k` (Opportunities collection + admin page; employment/internship/volunteer types)
- Created and linked new UI feature bean under epic `rocketbase-90wn`:

  - `rocketbase-nn0u` (UI theming system for site colors).

- Added feature plan docs: docs/plans/features/20-team-admin.md, docs/plans/features/21-services-admin.md, docs/plans/features/22-opportunities-admin.md, docs/plans/features/23-ui-theming-system.md
