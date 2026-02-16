# Web Stats Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Provide a privacy-conscious analytics dashboard for site and content performance.

## Overview

### User Stories

- Admins can view traffic trends and top content.
- Editors can compare post performance windows.
- Team can inspect source/referrer and device breakdowns.

### Success Criteria

- ✅ Daily/weekly/monthly traffic views
- ✅ Top pages/posts and entry sources
- ✅ Referrer/device summaries
- ✅ Exportable reports

## Scope

### In Scope

- Aggregated analytics views
- Basic dimensions (path, referrer, device, country optional)

### Out of Scope

- User-level tracking and invasive profiling
- Third-party ad attribution complexity

## Research Phase

1. Decide telemetry source (server logs vs event collection).
2. Define privacy and retention policy.
3. Define aggregation jobs and storage model.

## Development Phase

1. Add stats collection/aggregation jobs.
2. Build dashboard cards/charts/tables.
3. Add filters (date range, section, author).
4. Add report export endpoint.

## Testing Phase

- Unit: aggregation correctness
- Integration: ingestion -> dashboard query path
- E2E: filter/date-range interactions

## Documentation

- `docs/user-guide/web-stats.md`
- privacy policy note for analytics

## Completion Checklist

- [ ] aggregation pipeline complete
- [ ] dashboard UI complete
- [ ] exports complete
- [ ] tests passing
- [ ] docs updated
