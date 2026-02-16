# Event Calendar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an events publishing system with calendar views and iCal export.

## Overview

### User Stories

- Editors can create and publish events.
- Readers can browse upcoming/past events.
- Readers can download iCal entries.

### Success Criteria

- ✅ Event CRUD and publishing workflow
- ✅ Calendar + list views
- ✅ Timezone-aware date handling
- ✅ iCal export and event detail pages

## Scope

### In Scope

- Single and recurring events (simple recurrence)
- Public event pages with structured metadata
- iCal feed/download support

### Out of Scope

- Ticketing and seat inventory
- Complex recurrence exceptions

## Research Phase

1. Define event schema (start/end/timezone/location).
2. Evaluate recurrence support level for MVP.
3. Define SEO structured data requirements.

## Development Phase

1. Add event collection + migrations.
2. Build admin create/edit and publish flow.
3. Build public calendar/list/detail pages.
4. Add iCal generation endpoint.

## Testing Phase

- Unit: recurrence/date-time utilities
- Integration: iCal serialization validity
- E2E: create event and verify public rendering

## Documentation

- `docs/user-guide/event-calendar.md`
- date/timezone authoring guidance

## Completion Checklist

- [ ] schema + admin UI complete
- [ ] public views complete
- [ ] iCal export complete
- [ ] tests passing
- [ ] docs updated
