/// <reference path="../../pb_data/types.d.ts" />

// Audit logging for record delete
onRecordAfterDeleteSuccess(function (e) {
  try {
    if (!e.record || e.record.collection().name === 'audit_logs') {
      e.next();
      return;
    }

    var auditCollection = $app.findCollectionByNameOrId('audit_logs');
    if (!auditCollection) {
      e.next();
      return;
    }

    var auditRecord = new Record(auditCollection);
    auditRecord.set('event_type', 'delete');
    auditRecord.set('collection_name', e.record.collection().name);
    auditRecord.set('record_id', e.record.id);
    auditRecord.set('timestamp', new Date().toISOString());
    auditRecord.set('before_changes', e.record.clone().withCustomData(true).publicExport());
    $app.save(auditRecord);
  } catch (err) {
    console.error('[Audit] delete failed: ' + err.toString());
  }

  e.next();
});

console.log('[Hooks] Record delete audit initialized');
