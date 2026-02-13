---
# rocketbase-n4yt
title: Setup internal redirects from PocketBase redirects collection
status: todo
type: feature
priority: normal
created_at: 2026-02-13T23:52:29Z
updated_at: 2026-02-13T23:52:29Z
---

Implement server-side redirect handling that queries the PocketBase redirects collection and performs redirects before the catch-all [...slug] route is reached.

## Requirements

- Query the redirects collection from PocketBase on each request
- Match incoming request paths against redirect rules
- Support different redirect status codes (301 permanent, 302 temporary)
- Handle wildcard/pattern matching if needed
- Execute before the fallthrough [...slug] route
- Cache redirect rules for performance (optional optimization)

## Implementation Approach

1. Add redirect handling in `src/hooks.server.ts` handle function
2. Query redirects collection from PocketBase
3. Match request URL against redirect rules
4. Return appropriate redirect response if match found
5. Continue normal flow if no redirect matches

## Files to Modify

- `app/src/hooks.server.ts` - Add redirect logic to handle function
- Consider caching strategy for redirect rules (memory cache with TTL)

## Testing

- Add unit tests for redirect matching logic
- Add E2E tests for various redirect scenarios
- Test redirect precedence over catch-all route
