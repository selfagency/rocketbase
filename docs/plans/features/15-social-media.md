# Social Media Scheduler Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Schedule and publish post syndication to supported social platforms.

## Overview

### User Stories

- Editors can schedule platform-specific social posts.
- Editors can track publication outcomes per platform.
- Failed posts can be retried from an admin dashboard.

### Success Criteria

- ✅ Compose + schedule UI tied to posts
- ✅ Queue-backed publish jobs
- ✅ Platform adapter abstraction and status tracking
- ✅ Retry/failure handling

## Scope

### In Scope

- Initial platform set (e.g., Bluesky, Mastodon, X optional)
- Scheduled + immediate dispatch
- Basic content templating per platform

### Out of Scope

- Advanced social listening and engagement analytics

## Research Phase

1. Confirm platform API auth and rate-limit constraints.
2. Define adapter interface for platform clients.
3. Define content templating and shortening rules.

## Development Phase

1. Add social campaign schema and schedule fields.
2. Build compose/schedule UI with preview.
3. Implement sidecar adapters and queue processing.
4. Persist publish results and retry metadata.

## Testing Phase

- Unit: platform payload builders
- Integration: scheduler -> queue -> adapter lifecycle
- E2E: schedule campaign and verify status updates

## Documentation

- `docs/user-guide/social-scheduler.md`
- platform credential setup guide

## Completion Checklist

- [ ] scheduling UI complete
- [ ] adapter layer complete
- [ ] queue processing complete
- [ ] tests passing
- [ ] docs updated
