# Newsletters and Transactional Email Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver scheduled newsletters and essential transactional emails with observable queue processing.

## Overview

### User Stories

- Editors can compose and schedule newsletters.
- Subscribers receive emails based on list/tier preferences.
- System sends transactional emails reliably.

### Success Criteria

- ✅ Newsletter composer + scheduling
- ✅ Audience selection and segmentation basics
- ✅ Queue-based delivery with retries
- ✅ Template system for transactional email
- ✅ Delivery tracking and failure visibility

## Scope

### In Scope

- Newsletter campaigns
- Transactional templates (auth + billing essentials)
- Sidecar-driven send pipeline

### Out of Scope

- Advanced A/B testing
- Complex visual drag/drop email builder

## Research Phase

1. Confirm sidecar queue capabilities and SMTP pipeline.
2. Define campaign and recipient schema.
3. Define template strategy and localization requirements.

## Development Phase

1. Add campaign/recipient tracking collections.
2. Build admin compose/schedule UI.
3. Implement queue job creation and processing.
4. Add delivery and retry status reporting.

## Testing Phase

- Unit: template rendering and variable validation
- Integration: schedule -> queue -> send lifecycle
- E2E: create campaign and verify queue status updates

## Documentation

- `docs/user-guide/newsletters.md`
- `docs/development/email-pipeline.md`

## Completion Checklist

- [ ] campaign schema + UI complete
- [ ] queue integration complete
- [ ] transactional templates complete
- [ ] tests passing
- [ ] docs updated
