---
# rocketbase-e2g1
title: Create admin route - post index and CRUD
status: completed
type: task
priority: normal
created_at: 2026-02-14T20:59:03Z
updated_at: 2026-02-14T21:07:44Z
---

Implement /admin/posts index, create, edit, and delete routes mirroring admin/pages, include full posts fields and author lookup/expand behavior.

## Progress Checklist

- [x] Mirror admin/pages route structure for posts index/new/edit
- [x] Implement posts table, columns, and row actions
- [x] Add full posts field support in create/edit forms and server actions
- [x] Integrate author lookup and expanded author flattening in posts index
- [x] Run Svelte check and lint validation

## Summary of Changes

Implemented a full `/admin/posts` CRUD surface modeled on `/admin/pages`, including:
- index route with pagination/search/status/author filtering and delete action
- create + edit routes with Superforms + Zod validation
- support for all editable Posts fields (title, slug, summary, content, date, embed, enclosure, image, attachments, author, tags, published, visible, require_login, subscriber_only)
- author lookup map built from users collection and expanded-author flattening for table display/filtering
- reusable admin posts UI components (table, actions, title cell, post form)
- admin nav link to `/admin/posts`

Validation:
- `pnpm check` (app) passed with 0 errors/warnings
- `pnpm lint` (app) passed with pre-existing warnings unrelated to this change
