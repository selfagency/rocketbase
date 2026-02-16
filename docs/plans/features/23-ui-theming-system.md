# UI Theming System Implementation Plan

> **For Claude:** Use superpowers:executing-plans to implement this plan.

## Overview

- Goal: Add a runtime UI theming system that allows site color customization from admin settings.
- User stories:
  - As an admin, I can pick a theme preset or customize theme tokens.
  - As a visitor, I see a coherent accessible theme across pages.
  - As a maintainer, I can safely enforce contrast-aware defaults.
- Success criteria:
  - Theme changes apply globally without code edits.
  - Contrast validation prevents unreadable token combinations.

## Scope

- Theme token model (brand + semantic tokens).
- Admin settings UI for theme selection/configuration.
- Runtime application of active theme (SSR-safe).
- Validation, tests, and docs.

## Theme Model (Draft)

- Core brand tokens: primary, secondary, accent.
- Semantic tokens: background, foreground, muted, border, destructive.
- Optional dark theme overrides.
- Persisted via metadata/settings collection.

## Accessibility Requirements

- WCAG 2.2 AA contrast checks for text/background combinations.
- Non-color indicators preserved for critical states.
- Keyboard and screen-reader flows remain unchanged.

## Testing

- Unit tests: token validation and contrast checks.
- Integration tests: settings update and runtime token application.
- E2E: theme update flow and visual smoke checks.

## Documentation

- Admin guide for choosing/customizing themes.
- Developer guide for token usage and extension.
