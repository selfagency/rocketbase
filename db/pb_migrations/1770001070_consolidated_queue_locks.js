/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collectionData = {
  "id": "v2i9s97ijtkb6as",
  "name": "queue_locks",
  "type": "base",
  "system": false,
  "listRule": null,
  "viewRule": null,
  "createRule": null,
  "updateRule": null,
  "deleteRule": null,
  "fields": [
    {
      "autogeneratePattern": "[a-z0-9]{15}",
      "hidden": false,
      "id": "text3208210256",
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
      "autogeneratePattern": "",
      "hidden": false,
      "id": "gb9nqipq",
      "max": 0,
      "min": 0,
      "name": "worker_id",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": true,
      "system": false,
      "type": "text"
    },
    {
      "cascadeDelete": false,
      "collectionId": "qgf0f8rtdk0s6pq",
      "hidden": false,
      "id": "of2tn7ct",
      "maxSelect": 1,
      "minSelect": 0,
      "name": "task",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "relation"
    },
    {
      "hidden": false,
      "id": "autodate_created_queue_locks",
      "name": "created",
      "onCreate": true,
      "onUpdate": false,
      "presentable": false,
      "system": false,
      "type": "autodate"
    }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX `idx_SKtU4DZ` ON `queue_locks` (`task`)",
    "CREATE INDEX `idx_GpAPmOu` ON `queue_locks` (`created`)"
  ]
};
    const collectionCreateData = {
  "id": "v2i9s97ijtkb6as",
  "name": "queue_locks",
  "type": "base",
  "system": false,
  "listRule": null,
  "viewRule": null,
  "createRule": null,
  "updateRule": null,
  "deleteRule": null,
  "fields": [
    {
      "autogeneratePattern": "[a-z0-9]{15}",
      "hidden": false,
      "id": "text3208210256",
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
      "autogeneratePattern": "",
      "hidden": false,
      "id": "gb9nqipq",
      "max": 0,
      "min": 0,
      "name": "worker_id",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": true,
      "system": false,
      "type": "text"
    },
    {
      "cascadeDelete": false,
      "collectionId": "qgf0f8rtdk0s6pq",
      "hidden": false,
      "id": "of2tn7ct",
      "maxSelect": 1,
      "minSelect": 0,
      "name": "task",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "relation"
    },
    {
      "hidden": false,
      "id": "autodate_created_queue_locks",
      "name": "created",
      "onCreate": true,
      "onUpdate": false,
      "presentable": false,
      "system": false,
      "type": "autodate"
    }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX `idx_SKtU4DZ` ON `queue_locks` (`task`)",
    "CREATE INDEX `idx_GpAPmOu` ON `queue_locks` (`created`)"
  ]
};
    const collectionUpdateData = {
  "name": "queue_locks",
  "type": "base",
  "system": false,
  "listRule": null,
  "viewRule": null,
  "createRule": null,
  "updateRule": null,
  "deleteRule": null,
  "fields": [
    {
      "autogeneratePattern": "[a-z0-9]{15}",
      "hidden": false,
      "id": "text3208210256",
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
      "autogeneratePattern": "",
      "hidden": false,
      "id": "gb9nqipq",
      "max": 0,
      "min": 0,
      "name": "worker_id",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": true,
      "system": false,
      "type": "text"
    },
    {
      "cascadeDelete": false,
      "collectionId": "qgf0f8rtdk0s6pq",
      "hidden": false,
      "id": "of2tn7ct",
      "maxSelect": 1,
      "minSelect": 0,
      "name": "task",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "relation"
    },
    {
      "hidden": false,
      "id": "autodate_created_queue_locks",
      "name": "created",
      "onCreate": true,
      "onUpdate": false,
      "presentable": false,
      "system": false,
      "type": "autodate"
    }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX `idx_SKtU4DZ` ON `queue_locks` (`task`)",
    "CREATE INDEX `idx_GpAPmOu` ON `queue_locks` (`created`)"
  ]
};

    let collection = null;
    try {
        collection = app.findCollectionByNameOrId("v2i9s97ijtkb6as");
    } catch (_) {
        collection = null;
    }

    if (!collection) {
        try {
            collection = app.findCollectionByNameOrId("queue_locks");
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
        const collection = app.findCollectionByNameOrId("v2i9s97ijtkb6as");
        return app.delete(collection);
    } catch (_) {
        try {
            const collection = app.findCollectionByNameOrId("queue_locks");
            return app.delete(collection);
        } catch (_) {
            return null;
        }
    }
})
