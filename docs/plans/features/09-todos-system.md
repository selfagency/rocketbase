# Todos System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a lightweight task system for editorial and operational work.

## Overview

### User Stories

- Team members can create and assign todos.
- Users can set due dates, priority, and status.
- Users can filter by assignee, due date, and completion state.

### Success Criteria

- ✅ Todo CRUD with assignees
- ✅ Priority + due-date support
- ✅ Status lifecycle (`todo`, `in_progress`, `blocked`, `done`)
- ✅ Mentions/notifications integration (basic)
- ✅ Tests + docs

## Scope

### In Scope

- Team-internal todos
- Optional relation to posts/editorial cards
- Basic reminders (daily digest optional)

### Out of Scope

- Full PM suite (dependencies, burndown charts)

## Research Phase

1. Evaluate reuse vs overlap with `.beans` workflow.
2. Define app-facing todo schema and permissions.
3. Define notification strategy for assignments/overdue.

## Development Phase

1. Add `todos` collection + migrations.
2. Build list + detail + create/edit UI.
3. Add assignment picker and filters.
4. Add links to related posts/cards where present.

## Testing Phase

- Unit: schema/validation and status transitions
- Integration: assignment + completion workflows
- E2E: create, assign, complete, filter

## Documentation

- `docs/user-guide/todos.md`
- `docs/development/todos-architecture.md`

## Completion Checklist

- [ ] schema and CRUD complete
- [ ] assignment/filters complete
- [ ] status transitions complete
- [ ] tests passing
- [ ] docs updated
