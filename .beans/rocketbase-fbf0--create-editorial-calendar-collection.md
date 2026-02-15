---
# rocketbase-fbf0
title: Create editorial calendar collection
status: todo
type: task
priority: normal
created_at: 2026-02-15T04:04:35Z
updated_at: 2026-02-15T04:12:47Z
---

Design and add PocketBase editorial calendar collection schema for planning/scheduling editorial items.

## Fields

- working_title (string)
- pitch (wysiwyg editor)
- draft_url (url)
- authors (users[])
- editors (users[])
- deadline (datetime)
- publish_date (datetime)
- post (single posts relation)
- status (enum accepted, researching, writing, editing, ready, published, canceled)
