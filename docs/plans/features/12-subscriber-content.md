# Subscriber-Only Content Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enforce content access based on subscription tiers and post visibility rules.

## Overview

### User Stories

- Editors can mark posts by visibility tier.
- Subscribers can view entitled content.
- Non-subscribers see clear upgrade prompts.

### Success Criteria

- ✅ Post-level visibility settings (public/subscriber/tiered)
- ✅ Server-side access enforcement
- ✅ Upgrade CTA for blocked content
- ✅ Preview/snippet support for locked posts
- ✅ Tests covering entitlement edge cases

## Scope

### In Scope

- Tier checks in page server loads
- Locked-content template and CTA
- Optional teaser length settings

### Out of Scope

- DRM/content obfuscation
- Device/session concurrency controls

## Research Phase

1. Audit existing `subscriber_only` field and related post schema.
2. Define tier precedence and fallback rules.
3. Define unauthorized/expired subscription UX behavior.

## Development Phase

1. Extend post schema for visibility tiers.
2. Add server-side entitlement guard utilities.
3. Add locked-content rendering components.
4. Update admin post form visibility controls.

## Testing Phase

- Unit: entitlement guard logic
- Integration: post load with different user tiers
- E2E: locked post -> subscribe -> unlock flow

## Documentation

- `docs/user-guide/subscriber-content.md`
- entitlement matrix documentation

## Completion Checklist

- [ ] tier model integrated into posts
- [ ] server enforcement complete
- [ ] locked-content UX complete
- [ ] tests passing
- [ ] docs updated
