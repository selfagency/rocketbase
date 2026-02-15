---
# rocketbase-bgq2
title: Add OpenGraph tags
status: completed
type: feature
priority: high
created_at: 2026-02-13T22:51:53Z
updated_at: 2026-02-15T08:19:59Z
parent: rocketbase-inji
---

Implement OpenGraph meta tags for better social media sharing. See: https://ogp.me/

## Summary of Changes\n- Implemented base OpenGraph and Twitter meta tags in root layout.\n- Added dynamic OpenGraph tags for pages, posts, authors, and tags (removed Twitter support).\n- Added 'noindex' and 'nofollow' tags for admin routes.\n- Integrated with site metadata from PocketBase (site_title, site_description, og_image, twitter_site, twitter_handle).\n- Added 'og:locale' support via Paraglide.
