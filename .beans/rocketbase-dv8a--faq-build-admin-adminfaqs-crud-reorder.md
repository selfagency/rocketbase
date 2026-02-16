---
# rocketbase-dv8a
title: 'FAQ: build admin /admin/faqs CRUD + reorder'
status: todo
type: task
priority: critical
created_at: 2026-02-16T02:04:21Z
updated_at: 2026-02-16T02:11:31Z
parent: rocketbase-15d7
blocked_by:
    - rocketbase-creq
---

## Goal
Provide admin management for FAQ entries.

## Tasks
- [ ] Add route(s) under `app/src/routes/admin/faqs`
- [ ] Implement create/edit/delete actions with validation
- [ ] Implement publish toggle and sort-order controls (up/down)
- [ ] Ensure admin-only access enforcement and friendly unauthorized handling
- [ ] Add success/error toasts and form feedback

## Acceptance Criteria
- Admin can create, update, delete, publish/unpublish, and reorder FAQs
- Non-admin users cannot perform admin FAQ actions
- Validation errors are clear and actionable
