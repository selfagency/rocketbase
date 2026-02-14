---
# rocketbase-wjz7
title: Add structured data markup
status: completed
type: feature
priority: high
created_at: 2026-02-13T22:51:54Z
updated_at: 2026-02-14T06:09:11Z
---

Implement structured data (Schema.org) for better SEO. See: http://www.structured-data.org/


## Summary of Changes
- Integrated Schema.org structured data (JSON-LD) using `svelte-meta-tags`.
- **Global**: Added `WebSite` and `Organization` schema to the main layout.
- **Posts**: Added detailed `BlogPosting` schema including headlines, authors (with profile links), dates, and publisher info.
- **Authors**: Added `Person` schema to author profile pages with bio, image, and website links (`sameAs`).
- **CMS Pages**: Added `WebPage` schema to fallthrough slug routes.
