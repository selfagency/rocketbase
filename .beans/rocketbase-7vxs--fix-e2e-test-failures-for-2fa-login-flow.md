---
# rocketbase-7vxs
title: Fix e2e test failures for 2FA login flow
status: in-progress
type: task
priority: normal
created_at: 2026-02-12T17:43:08Z
updated_at: 2026-02-12T19:31:00Z
---

## CI Failure Root Cause\n\nIn CI, PocketBase and Mailpit are started with `docker run` without a shared Docker network. PocketBase SMTP is configured with `host: "mailpit"` but can't resolve the hostname. Locally it works because `docker-compose.test.yml` creates a bridge network.\n\n### Fix\n- Create a Docker network in CI\n- Attach both PocketBase and Mailpit containers to it
