/// <reference path="../pb_data/types.d.ts" />

// Audit logging for record create
onRecordAfterCreateSuccess(function (e) {
  if (e.record.collection().name === 'audit_logs') {
    return;
  }
  try {
    var auditCollection = $app.findCollectionByNameOrId('audit_logs');
    if (!auditCollection) {
      return;
    }
    var auditRecord = new Record(auditCollection);
    auditRecord.set('event_type', 'create');
    auditRecord.set('collection_name', e.record.collection().name);
    auditRecord.set('record_id', e.record.id);
    auditRecord.set('timestamp', new Date().toISOString());
    $app.save(auditRecord);
  } catch (err) {
    console.error('[Audit] create failed: ' + err.toString());
  }

  e.next();
});

console.log('[Hooks] Record create audit initialized');
