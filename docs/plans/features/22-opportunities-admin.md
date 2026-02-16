# Opportunities Admin (Collection + UI) Implementation Plan

> **For Claude:** Use superpowers:executing-plans to implement this plan.

## Overview

- Goal: Add an `opportunities` collection and admin UI for hiring and volunteer listings.
- User stories:
  - As an admin, I can manage opportunities by type and status.
  - As an editor, I can publish time-bound opportunities with apply links.
  - As a visitor, I can browse active opportunities.
- Success criteria:
  - CRUD works from `/admin/opportunities` and `/admin/opportunities/[id]`.
  - Type filtering supports employment/internship/volunteer.

## Scope

- Collection schema/migration for `opportunities`.
- Admin index + form routes with filtering.
- Public opportunities listing integration.
- Validation, tests, and docs.

## Data Model (Draft)

- `title` (required)
- `summary` (required)
- `description` (optional rich text)
- `type` (required enum: `employment`, `internship`, `volunteer`)
- `status` (draft/open/closed)
- `apply_url` (optional URL)
- `publish_from` / `publish_until` (optional datetime)
- `order` (number)
- `published` (bool)
- `visible` (bool)

## Testing

- Unit tests: enum validation + date window logic.
- Integration tests: admin actions and type/status filters.
- E2E: create/edit/publish flow and frontend listing behavior.

## Documentation

- Admin usage guide for opportunities management.
- Developer notes for enum handling and scheduling behavior.
