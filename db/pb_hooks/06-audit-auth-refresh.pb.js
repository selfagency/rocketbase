/// <reference path="../pb_data/types.d.ts" />

// Token refresh requests are intentionally excluded from audit logs.
onRecordAuthRefreshRequest(function (e) {
  e.next();
});

console.log('[Hooks] Token refresh audit excluded');
