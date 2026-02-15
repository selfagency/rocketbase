---
# rocketbase-tj16
title: 'Phase 2: Extract server services'
status: completed
type: task
priority: normal
created_at: 2026-02-15T08:02:04Z
updated_at: 2026-02-15T08:31:31Z
parent: rocketbase-gw8p
---

Tasks 2.1-2.9 from plan\n\n- [x] 2.1 Extract profile service from account/+page.server.ts\n- [x] 2.2 Extract MFA service from account/+page.server.ts\n- [x] 2.3 Extract Pexels service from api/admin/media/+server.ts\n- [x] 2.4 Extract media repository from api/admin/media/+server.ts\n- [x] 2.5 Extract content snapshot mappers\n- [x] 2.6 Add tests for page-size-store.ts\n- [x] 2.7 Add tests for redirect-handler.ts and redirect-store.ts\n- [x] 2.8 Add tests for revision-history.ts\n- [x] 2.9 Add tests for nav.ts

## Summary of Changes\n\n- Extracted  with host validation, image download, and media import helpers.\n- Extracted  with shared media mapping, filter building, attachment parsing, and attachment resolution utilities.\n- Extracted shared  and refactored post/page restore actions to use unified snapshot-to-update payload mappers.\n- Refactored , , and  to consume extracted modules.\n- Added server tests for new services/repository/mapper modules and validated related server utility tests.

## Summary of Changes (corrected)\n\n- Extracted pexels-service.ts with host validation, image download, and media import helpers.\n- Extracted media-repository.ts with shared media mapping, filter building, attachment parsing, and attachment resolution utilities.\n- Extracted shared content-mapper.ts and refactored post/page restore actions to use unified snapshot-to-update payload mappers.\n- Refactored app/src/routes/api/admin/media/+server.ts, app/src/routes/admin/posts/[id]/+page.server.ts, and app/src/routes/admin/pages/[id]/+page.server.ts to consume extracted modules.\n- Added server tests for new services/repository/mapper modules and validated related server utility tests.
