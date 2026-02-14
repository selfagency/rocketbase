---
# rocketbase-8fhe
title: Fix /posts returning 401
status: scrapped
type: bug
priority: normal
created_at: 2026-02-14T21:14:22Z
updated_at: 2026-02-14T21:17:34Z
---

Investigate and fix unauthorized response on public /posts route.

## Reasons for Scrapping

- Reported /posts 401 could not be reproduced during direct HTTP verification.
- /posts returned HTTP 200 when tested locally.
- User confirmed the original 401 observation was due to not being logged in.
