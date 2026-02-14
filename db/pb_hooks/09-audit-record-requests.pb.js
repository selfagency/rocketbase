/// <reference path="../pb_data/types.d.ts" />

function findAuditCollection() {
	return $app.findCollectionByNameOrId('audit_logs');
}

function exportRecord(record) {
	if (!record) {
		return null;
	}

	return record.clone().withCustomData(true).publicExport();
}

function resolveCollectionName(e) {
	if (e.record && e.record.collection()) {
		return e.record.collection().name;
	}

	if (e.collection) {
		return e.collection.name;
	}

	return '';
}

function resolveAuthUserId(e) {
	if (e.auth && e.auth.collection && e.auth.collection().name === 'users') {
		return e.auth.id;
	}

	return '';
}

function writeRequestAudit(e, eventType, beforeChanges, afterChanges) {
	var collectionName = resolveCollectionName(e);
	if (collectionName === 'audit_logs') {
		return;
	}

	var auditCollection = findAuditCollection();
	if (!auditCollection) {
		return;
	}

	var reqInfo = e.requestInfo();
	var auditRecord = new Record(auditCollection);

	auditRecord.set('event_type', eventType);
	auditRecord.set('collection_name', collectionName);
	auditRecord.set('record_id', e.record ? e.record.id : '');

	var userId = resolveAuthUserId(e);
	if (userId) {
		auditRecord.set('user', userId);
	}

	auditRecord.set('request_method', reqInfo.method || '');
	auditRecord.set('request_url', reqInfo.context || '');
	auditRecord.set('request_ip', e.realIP());
	auditRecord.set('before_changes', beforeChanges);
	auditRecord.set('after_changes', afterChanges);
	auditRecord.set('timestamp', new Date().toISOString());

	$app.save(auditRecord);
}

onRecordCreateRequest(function (e) {
	try {
		writeRequestAudit(e, 'create_request', null, exportRecord(e.record));
	} catch (err) {
		console.error('[Audit] create_request failed: ' + err.toString());
	}

	e.next();
});

onRecordUpdateRequest(function (e) {
	try {
		var beforeChanges = e.record ? exportRecord(e.record.original()) : null;
		var afterChanges = exportRecord(e.record);

		writeRequestAudit(e, 'update_request', beforeChanges, afterChanges);
	} catch (err) {
		console.error('[Audit] update_request failed: ' + err.toString());
	}

	e.next();
});

onRecordDeleteRequest(function (e) {
	try {
		writeRequestAudit(e, 'delete_request', exportRecord(e.record), null);
	} catch (err) {
		console.error('[Audit] delete_request failed: ' + err.toString());
	}

	e.next();
});

console.log('[Hooks] Record request audit initialized');

