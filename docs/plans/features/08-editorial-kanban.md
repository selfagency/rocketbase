# Editorial Kanban Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Provide an editorial workflow board for planning and moving stories through publication stages.

## Overview

### User Stories

- Editors can create cards for ideas/posts.
- Team members can move cards across stages.
- Cards can be assigned, prioritized, and due-dated.

### Success Criteria

- ✅ Board with configurable columns
- ✅ Drag/drop card movement
- ✅ Assignment + due date + priority
- ✅ Role-based permissions
- ✅ Search/filter for assignee/status

## Scope

### In Scope

- Default pipeline: Idea → Draft → Review → Scheduled → Published
- Card comments/activity notes
- Basic audit trail integration

### Out of Scope

- Complex roadmap/Gantt views
- Cross-project portfolio planning

## Research Phase

1. Audit existing admin table/list patterns.
2. Decide data model (`editorial_items`, `editorial_columns` vs fixed columns).
3. Define permission model for moves and edits.

## Development Phase

1. Add collection schema and relations to posts/users.
2. Build board page with drag/drop interactions.
3. Add card details sheet/dialog.
4. Add filters and saved views.
5. Hook transitions into audit logs.

## Testing Phase

- Unit: status transition rules
- Integration: create/move/assign flow
- E2E: drag card through full workflow
- Accessibility: keyboard drag alternatives and announcements

## Documentation

- `docs/user-guide/editorial-kanban.md`
- workflow convention guide (column definitions)

## Completion Checklist

- [ ] schema + board UI complete
- [ ] drag/drop + keyboard alternatives complete
- [ ] assignments + due dates complete
- [ ] tests passing
- [ ] docs updated
