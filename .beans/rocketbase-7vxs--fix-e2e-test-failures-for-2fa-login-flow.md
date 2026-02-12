---
# rocketbase-7vxs
title: Fix e2e test failures for 2FA login flow
status: completed
type: task
priority: normal
created_at: 2026-02-12T17:43:08Z
updated_at: 2026-02-12T19:47:55Z
---

## CI Failure Root Cause\n\nIn CI, PocketBase and Mailpit are started with `docker run` without a shared Docker network. PocketBase SMTP is configured with `host: "mailpit"` but can't resolve the hostname. Locally it works because `docker-compose.test.yml` creates a bridge network.\n\n### Fix\n- Create a Docker network in CI\n- Attach both PocketBase and Mailpit containers to it

## Summary of Changes\n\nAdded a shared Docker bridge network (`test-net`) in the CI workflow so PocketBase can resolve the `mailpit` hostname for SMTP email delivery. Without the network, the two containers started via `docker run` couldn't communicate, causing all email-dependent tests (2FA OTP and email verification) to fail with 0 messages in Mailpit.\n\n**File changed:** `.github/workflows/test.yml` — added `docker network create test-net` and `--network test-net` to both container run commands.
