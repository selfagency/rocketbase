/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collectionData = {
  "id": "pbc_audit_logs",
  "name": "audit_logs",
  "type": "base",
  "system": false,
  "listRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && user.id = @request.auth.id)",
  "viewRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && user.id = @request.auth.id)",
  "createRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || @request.auth.role = \"contributor\"",
  "updateRule": "@request.auth.role = \"admin\"",
  "deleteRule": "@request.auth.role = \"admin\"",
  "fields": [
    {
      "autogeneratePattern": "[a-z0-9]{15}",
      "hidden": false,
      "id": "text_id",
      "max": 15,
      "min": 15,
      "name": "id",
      "pattern": "^[a-z0-9]+$",
      "presentable": false,
      "primaryKey": true,
      "required": true,
      "system": true,
      "type": "text"
    },
    {
      "hidden": false,
      "id": "select_event_type",
      "maxSelect": 1,
      "name": "event_type",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "select",
      "values": [
        "create_request",
        "update_request",
        "delete_request",
        "create",
        "update",
        "delete",
        "auth"
      ]
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_collection_name",
      "max": 255,
      "min": 0,
      "name": "collection_name",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_record_id",
      "max": 0,
      "min": 0,
      "name": "record_id",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "cascadeDelete": false,
      "collectionId": "_pb_users_auth_",
      "hidden": false,
      "id": "relation_user",
      "maxSelect": 1,
      "minSelect": 0,
      "name": "user",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "relation"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_auth_method",
      "max": 100,
      "min": 0,
      "name": "auth_method",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_request_method",
      "max": 20,
      "min": 0,
      "name": "request_method",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_request_ip",
      "max": 100,
      "min": 0,
      "name": "request_ip",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_request_url",
      "max": 2000,
      "min": 0,
      "name": "request_url",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "hidden": false,
      "id": "date_timestamp",
      "max": "",
      "min": "",
      "name": "timestamp",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "date"
    },
    {
      "hidden": false,
      "id": "json_before_changes",
      "maxSize": 2000000,
      "name": "before_changes",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "json"
    },
    {
      "hidden": false,
      "id": "json_after_changes",
      "maxSize": 2000000,
      "name": "after_changes",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "json"
    },
    {
      "hidden": false,
      "id": "autodate_created",
      "name": "created",
      "onCreate": true,
      "onUpdate": false,
      "presentable": false,
      "system": false,
      "type": "autodate"
    },
    {
      "hidden": false,
      "id": "autodate_updated",
      "name": "updated",
      "onCreate": true,
      "onUpdate": true,
      "presentable": false,
      "system": false,
      "type": "autodate"
    }
  ],
  "indexes": [
    "CREATE INDEX idx_audit_logs_collection_name ON audit_logs (collection_name)",
    "CREATE INDEX idx_audit_logs_record_id ON audit_logs (record_id)",
    "CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp)",
    "CREATE INDEX idx_audit_logs_user ON audit_logs (user)",
    "CREATE INDEX idx_audit_logs_event_type ON audit_logs (event_type)",
    "CREATE INDEX idx_audit_logs_collection_timestamp ON audit_logs (collection_name, timestamp)",
    "CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs (user, timestamp)"
  ]
};
    const collectionCreateData = {
  "id": "pbc_audit_logs",
  "name": "audit_logs",
  "type": "base",
  "system": false,
  "listRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && user.id = @request.auth.id)",
  "viewRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && user.id = @request.auth.id)",
  "createRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || @request.auth.role = \"contributor\"",
  "updateRule": "@request.auth.role = \"admin\"",
  "deleteRule": "@request.auth.role = \"admin\"",
  "fields": [
    {
      "autogeneratePattern": "[a-z0-9]{15}",
      "hidden": false,
      "id": "text_id",
      "max": 15,
      "min": 15,
      "name": "id",
      "pattern": "^[a-z0-9]+$",
      "presentable": false,
      "primaryKey": true,
      "required": true,
      "system": true,
      "type": "text"
    },
    {
      "hidden": false,
      "id": "select_event_type",
      "maxSelect": 1,
      "name": "event_type",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "select",
      "values": [
        "create_request",
        "update_request",
        "delete_request",
        "create",
        "update",
        "delete",
        "auth"
      ]
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_collection_name",
      "max": 255,
      "min": 0,
      "name": "collection_name",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_record_id",
      "max": 0,
      "min": 0,
      "name": "record_id",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "cascadeDelete": false,
      "collectionId": "_pb_users_auth_",
      "hidden": false,
      "id": "relation_user",
      "maxSelect": 1,
      "minSelect": 0,
      "name": "user",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "relation"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_auth_method",
      "max": 100,
      "min": 0,
      "name": "auth_method",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_request_method",
      "max": 20,
      "min": 0,
      "name": "request_method",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_request_ip",
      "max": 100,
      "min": 0,
      "name": "request_ip",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_request_url",
      "max": 2000,
      "min": 0,
      "name": "request_url",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "hidden": false,
      "id": "date_timestamp",
      "max": "",
      "min": "",
      "name": "timestamp",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "date"
    },
    {
      "hidden": false,
      "id": "json_before_changes",
      "maxSize": 2000000,
      "name": "before_changes",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "json"
    },
    {
      "hidden": false,
      "id": "json_after_changes",
      "maxSize": 2000000,
      "name": "after_changes",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "json"
    },
    {
      "hidden": false,
      "id": "autodate_created",
      "name": "created",
      "onCreate": true,
      "onUpdate": false,
      "presentable": false,
      "system": false,
      "type": "autodate"
    },
    {
      "hidden": false,
      "id": "autodate_updated",
      "name": "updated",
      "onCreate": true,
      "onUpdate": true,
      "presentable": false,
      "system": false,
      "type": "autodate"
    }
  ],
  "indexes": [
    "CREATE INDEX idx_audit_logs_collection_name ON audit_logs (collection_name)",
    "CREATE INDEX idx_audit_logs_record_id ON audit_logs (record_id)",
    "CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp)",
    "CREATE INDEX idx_audit_logs_user ON audit_logs (user)",
    "CREATE INDEX idx_audit_logs_event_type ON audit_logs (event_type)",
    "CREATE INDEX idx_audit_logs_collection_timestamp ON audit_logs (collection_name, timestamp)",
    "CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs (user, timestamp)"
  ]
};
    const collectionUpdateData = {
  "name": "audit_logs",
  "type": "base",
  "system": false,
  "listRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && user.id = @request.auth.id)",
  "viewRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && user.id = @request.auth.id)",
  "createRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || @request.auth.role = \"contributor\"",
  "updateRule": "@request.auth.role = \"admin\"",
  "deleteRule": "@request.auth.role = \"admin\"",
  "fields": [
    {
      "autogeneratePattern": "[a-z0-9]{15}",
      "hidden": false,
      "id": "text_id",
      "max": 15,
      "min": 15,
      "name": "id",
      "pattern": "^[a-z0-9]+$",
      "presentable": false,
      "primaryKey": true,
      "required": true,
      "system": true,
      "type": "text"
    },
    {
      "hidden": false,
      "id": "select_event_type",
      "maxSelect": 1,
      "name": "event_type",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "select",
      "values": [
        "create_request",
        "update_request",
        "delete_request",
        "create",
        "update",
        "delete",
        "auth"
      ]
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_collection_name",
      "max": 255,
      "min": 0,
      "name": "collection_name",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_record_id",
      "max": 0,
      "min": 0,
      "name": "record_id",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "cascadeDelete": false,
      "collectionId": "_pb_users_auth_",
      "hidden": false,
      "id": "relation_user",
      "maxSelect": 1,
      "minSelect": 0,
      "name": "user",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "relation"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_auth_method",
      "max": 100,
      "min": 0,
      "name": "auth_method",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_request_method",
      "max": 20,
      "min": 0,
      "name": "request_method",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_request_ip",
      "max": 100,
      "min": 0,
      "name": "request_ip",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text_request_url",
      "max": 2000,
      "min": 0,
      "name": "request_url",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "hidden": false,
      "id": "date_timestamp",
      "max": "",
      "min": "",
      "name": "timestamp",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "date"
    },
    {
      "hidden": false,
      "id": "json_before_changes",
      "maxSize": 2000000,
      "name": "before_changes",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "json"
    },
    {
      "hidden": false,
      "id": "json_after_changes",
      "maxSize": 2000000,
      "name": "after_changes",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "json"
    },
    {
      "hidden": false,
      "id": "autodate_created",
      "name": "created",
      "onCreate": true,
      "onUpdate": false,
      "presentable": false,
      "system": false,
      "type": "autodate"
    },
    {
      "hidden": false,
      "id": "autodate_updated",
      "name": "updated",
      "onCreate": true,
      "onUpdate": true,
      "presentable": false,
      "system": false,
      "type": "autodate"
    }
  ],
  "indexes": [
    "CREATE INDEX idx_audit_logs_collection_name ON audit_logs (collection_name)",
    "CREATE INDEX idx_audit_logs_record_id ON audit_logs (record_id)",
    "CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp)",
    "CREATE INDEX idx_audit_logs_user ON audit_logs (user)",
    "CREATE INDEX idx_audit_logs_event_type ON audit_logs (event_type)",
    "CREATE INDEX idx_audit_logs_collection_timestamp ON audit_logs (collection_name, timestamp)",
    "CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs (user, timestamp)"
  ]
};

    let collection = null;
    try {
        collection = app.findCollectionByNameOrId("pbc_audit_logs");
    } catch (_) {
        collection = null;
    }

    if (!collection) {
        try {
            collection = app.findCollectionByNameOrId("audit_logs");
        } catch (_) {
            collection = null;
        }
    }

    if (collection) {
        unmarshal(collectionUpdateData, collection);
        return app.save(collection);
    }

    collection = new Collection(collectionCreateData);
    const createResult = app.save(collection);

    if (false) {
        unmarshal(collectionUpdateData, collection);
        return app.save(collection);
    }

    return createResult;
}, (app) => {
    try {
        const collection = app.findCollectionByNameOrId("pbc_audit_logs");
        return app.delete(collection);
    } catch (_) {
        try {
            const collection = app.findCollectionByNameOrId("audit_logs");
            return app.delete(collection);
        } catch (_) {
            return null;
        }
    }
})
