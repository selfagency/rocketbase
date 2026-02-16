# Services Admin (Collection + UI) Implementation Plan

> **For Claude:** Use superpowers:executing-plans to implement this plan.

## Overview

- Goal: Add a `services` collection and admin UI to manage service offerings.
- User stories:
  - As an admin, I can create/edit/delete service entries.
  - As an editor, I can set order, visibility, and publication status.
  - As a visitor, I can view services in configured site sections.
- Success criteria:
  - CRUD works from `/admin/services` and `/admin/services/[id]`.
  - Services display consistently in frontend components.

## Scope

- Collection schema/migration for `services`.
- Admin index + form routes.
- Public-facing rendering integration.
- Validation, tests, and docs.

## Data Model (Draft)

- `title` (required)
- `summary` (required)
- `details` (optional rich text)
- `icon` or `media` (optional)
- `pricing_hint` (optional)
- `order` (number)
- `published` (bool)
- `visible` (bool)

## Testing

- Unit tests: schema validators and formatter helpers.
- Integration tests: admin actions and filtering.
- E2E: create/edit flow and frontend visibility.

## Documentation

- Admin guide for services management.
- Developer notes for schema, routes, and rendering hooks.
