---
title: "Add RSS feeds (XML + JSON) and header links"
type: task
status: todo
priority: normal
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
