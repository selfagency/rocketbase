# Team Admin (Collection + UI) Implementation Plan

> **For Claude:** Use superpowers:executing-plans to implement this plan.

## Overview

- Goal: Add a `team` collection and admin UI to manage people profiles shown on site pages.
- User stories:
  - As an admin, I can create/edit/delete team members.
  - As an editor, I can reorder and publish/unpublish team members.
  - As a visitor, I see the configured team content where enabled.
- Success criteria:
  - CRUD works from `/admin/team` and `/admin/team/[id]`.
  - Team records support ordering and visibility.

## Scope

- Collection schema/migration for `team`.
- Admin index + form routes.
- Shared UI components for team card/list rendering.
- Validation, tests, and docs.

## Data Model (Draft)

- `name` (required)
- `role` (required)
- `bio` (optional)
- `photo` (optional file)
- `links` (optional JSON/text)
- `order` (number)
- `published` (bool)
- `visible` (bool)

## Testing

- Unit tests: schema + formatter utilities.
- Integration tests: admin create/update/delete actions.
- E2E: admin workflows and public rendering.

## Documentation

- Admin usage guide for team management.
- Developer notes for schema and route conventions.
