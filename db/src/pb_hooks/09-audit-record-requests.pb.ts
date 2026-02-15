/// <reference path="../../pb_data/types.d.ts" />

onRecordCreateRequest(function (e) {
  try {
    var writeRequestAudit = function (eventType, beforeRecord, afterRecord) {
      var collectionName = '';
      if (e.record && e.record.collection()) {
        collectionName = e.record.collection().name;
      } else if (e.collection) {
        collectionName = e.collection.name;
      }

      if (collectionName === 'audit_logs') {
        return;
      }

      var auditCollection = $app.findCollectionByNameOrId('audit_logs');
      if (!auditCollection) {
        return;
      }

      var serializeRecord = function (record) {
        if (!record) {
          return null;
        }
        return record.clone().withCustomData(true).publicExport();
      };

      var reqInfo = e.requestInfo();
      var auditRecord = new Record(auditCollection);

      auditRecord.set('event_type', eventType);
      auditRecord.set('collection_name', collectionName);
      auditRecord.set('record_id', e.record ? e.record.id : '');

      if (e.auth && e.auth.collection && e.auth.collection().name === 'users') {
        auditRecord.set('user', e.auth.id);
      }

      auditRecord.set('request_method', reqInfo.method || '');
      auditRecord.set('request_url', reqInfo.context || '');
      auditRecord.set('request_ip', e.realIP());
      auditRecord.set('before_changes', serializeRecord(beforeRecord));
      auditRecord.set('after_changes', serializeRecord(afterRecord));
      auditRecord.set('timestamp', new Date().toISOString());

      $app.save(auditRecord);
    };

    writeRequestAudit('create_request', null, e.record);
  } catch (err) {
    console.error('[Audit] create_request failed: ' + err.toString());
  }

  e.next();
});

onRecordUpdateRequest(function (e) {
  try {
    var writeRequestAudit = function (eventType, beforeRecord, afterRecord) {
      var collectionName = '';
      if (e.record && e.record.collection()) {
        collectionName = e.record.collection().name;
      } else if (e.collection) {
        collectionName = e.collection.name;
      }

      if (collectionName === 'audit_logs') {
        return;
      }

      var auditCollection = $app.findCollectionByNameOrId('audit_logs');
      if (!auditCollection) {
        return;
      }

      var serializeRecord = function (record) {
        if (!record) {
          return null;
        }
        return record.clone().withCustomData(true).publicExport();
      };

      var reqInfo = e.requestInfo();
      var auditRecord = new Record(auditCollection);

      auditRecord.set('event_type', eventType);
      auditRecord.set('collection_name', collectionName);
      auditRecord.set('record_id', e.record ? e.record.id : '');

      if (e.auth && e.auth.collection && e.auth.collection().name === 'users') {
        auditRecord.set('user', e.auth.id);
      }

      auditRecord.set('request_method', reqInfo.method || '');
      auditRecord.set('request_url', reqInfo.context || '');
      auditRecord.set('request_ip', e.realIP());
      auditRecord.set('before_changes', serializeRecord(beforeRecord));
      auditRecord.set('after_changes', serializeRecord(afterRecord));
      auditRecord.set('timestamp', new Date().toISOString());

      $app.save(auditRecord);
    };

    var beforeRecord = e.record ? e.record.original() : null;

    writeRequestAudit('update_request', beforeRecord, e.record);
  } catch (err) {
    console.error('[Audit] update_request failed: ' + err.toString());
  }

  e.next();
});

onRecordDeleteRequest(function (e) {
  try {
    var writeRequestAudit = function (eventType, beforeRecord, afterRecord) {
      var collectionName = '';
      if (e.record && e.record.collection()) {
        collectionName = e.record.collection().name;
      } else if (e.collection) {
        collectionName = e.collection.name;
      }

      if (collectionName === 'audit_logs') {
        return;
      }

      var auditCollection = $app.findCollectionByNameOrId('audit_logs');
      if (!auditCollection) {
        return;
      }

      var serializeRecord = function (record) {
        if (!record) {
          return null;
        }
        return record.clone().withCustomData(true).publicExport();
      };

      var reqInfo = e.requestInfo();
      var auditRecord = new Record(auditCollection);

      auditRecord.set('event_type', eventType);
      auditRecord.set('collection_name', collectionName);
      auditRecord.set('record_id', e.record ? e.record.id : '');

      if (e.auth && e.auth.collection && e.auth.collection().name === 'users') {
        auditRecord.set('user', e.auth.id);
      }

      auditRecord.set('request_method', reqInfo.method || '');
      auditRecord.set('request_url', reqInfo.context || '');
      auditRecord.set('request_ip', e.realIP());
      auditRecord.set('before_changes', serializeRecord(beforeRecord));
      auditRecord.set('after_changes', serializeRecord(afterRecord));
      auditRecord.set('timestamp', new Date().toISOString());

      $app.save(auditRecord);
    };

    writeRequestAudit('delete_request', e.record, null);
  } catch (err) {
    console.error('[Audit] delete_request failed: ' + err.toString());
  }

  e.next();
});

console.log('[Hooks] Record request audit initialized');
