/// <reference path="../pb_data/types.d.ts" />

// Audit logging for OTP auth
onRecordAuthWithOTPRequest(function (e) {
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
    auditRecord.set('auth_method', 'otp');
    auditRecord.set('timestamp', new Date().toISOString());
    $app.save(auditRecord);
  } catch (err) {
    console.error('[Audit] auth_otp failed: ' + err.toString());
  }

  e.next();
});

console.log('[Hooks] OTP auth audit initialized');
