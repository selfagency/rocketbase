/// <reference path="../pb_data/types.d.ts" />

// Audit logging for token refresh
onRecordAuthRefreshRequest(function (e) {
  try {
    if (!e.record) {
      e.next();
      return;
    }

    var auditCollection = $app.findCollectionByNameOrId('audit_logs');
    if (!auditCollection) {
      e.next();
      return;
    }

    var reqInfo = e.requestInfo();

    var auditRecord = new Record(auditCollection);
    auditRecord.set('event_type', 'auth');
    auditRecord.set('collection_name', e.record.collection().name);
    auditRecord.set('record_id', e.record.id);
    if (e.record.collection().name === 'users') {
      auditRecord.set('user', e.record.id);
    }
    auditRecord.set('auth_method', 'token_refresh');
    auditRecord.set('request_method', reqInfo.method || 'POST');
    auditRecord.set('request_url', reqInfo.context || '');
    auditRecord.set('request_ip', e.realIP());
    auditRecord.set('timestamp', new Date().toISOString());
    $app.save(auditRecord);
  } catch (err) {
    console.error('[Audit] auth_refresh failed: ' + err.toString());
  }

  e.next();
});

console.log('[Hooks] Token refresh audit initialized');
