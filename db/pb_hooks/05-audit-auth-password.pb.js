/// <reference path="../pb_data/types.d.ts" />

// Audit logging for password auth
onRecordAuthWithPasswordRequest(function (e) {
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
    auditRecord.set('auth_method', 'password');
    auditRecord.set('timestamp', new Date().toISOString());
    $app.save(auditRecord);
  } catch (err) {
    console.error('[Audit] auth_password failed: ' + err.toString());
  }

  e.next();
});

console.log('[Hooks] Auth audit initialized');
