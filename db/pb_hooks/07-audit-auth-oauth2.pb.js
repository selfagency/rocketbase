/// <reference path="../pb_data/types.d.ts" />

// Audit logging for OAuth2 auth
onRecordAuthWithOAuth2Request(function (e) {
  try {
    if (!e.record) {
      return;
    }
    var auditCollection = $app.findCollectionByNameOrId('audit_logs');
    if (!auditCollection) {
      return;
    }
    var auditRecord = new Record(auditCollection);
    auditRecord.set('event_type', 'auth');
    auditRecord.set('collection_name', e.record.collection().name);
    auditRecord.set('record_id', e.record.id);
    auditRecord.set('auth_method', e.providerName || 'unknown');
    auditRecord.set('timestamp', new Date().toISOString());
    $app.save(auditRecord);
  } catch (err) {
    console.error('[Audit] auth_oauth2 failed: ' + err.toString());
  }

  e.next();
});

console.log('[Hooks] OAuth2 auth audit initialized');
