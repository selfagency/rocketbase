---
# rocketbase-ndx3
title: Add RSS feeds (XML + JSON) and header links
status: completed
type: task
priority: normal
created_at: 2026-02-13T22:56:00Z
updated_at: 2026-02-14T06:11:59Z
---

# Summary

Add RSS feeds for the site's posts: an XML RSS feed at `/feed/rss` and a JSON Feed at `/feed/json`. Expose both links in the site's `<svelte:head>` via the layout so browsers and feed readers discover them.

# Acceptance Criteria

- `/feed/rss` returns an RSS 2.0 XML feed conforming to https://www.rssboard.org/rss-specification with latest posts
- `/feed/json` returns a JSON Feed v1 at the same endpoint path
- The site `<svelte:head>` includes `<link rel="alternate" type="application/rss+xml" href="/feed/rss">` and `<link rel="alternate" type="application/json" href="/feed/json">`
- Feeds include correct titles, links, content, dates, and author information based on the `posts` collection

# Tasks

- [ ] Create route handlers for `/feed/rss` and `/feed/json`
- [ ] Add `<link rel="alternate">` tags to the root layout (`+layout.svelte` or `+layout.server.ts` using `<svelte:head>`)
- [ ] Ensure posts content is safely serialized (escape HTML where required)
- [ ] Add simple tests that verify feed responses and headers

# Notes

- Use PocketBase `posts` collection for content and metadata. Add caching headers for feeds when appropriate.

## Summary of Changes\n\n- Implemented RSS 2.0 feed at /feed/rss\n- Implemented JSON Feed v1.1 at /feed/json\n- Added feed discovery links to the root layout via MetaTags\n- Integrated proper author and tag expanded data in feeds
