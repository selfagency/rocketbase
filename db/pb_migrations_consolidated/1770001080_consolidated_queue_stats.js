/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collectionData = {
  "id": "ronp4q37zviiby1",
  "name": "queue_stats",
  "type": "view",
  "system": false,
  "listRule": null,
  "viewRule": null,
  "createRule": null,
  "updateRule": null,
  "deleteRule": null,
  "fields": [
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text3208210256",
      "max": 0,
      "min": 0,
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
      "id": "json3486377887",
      "maxSize": 1,
      "name": "pending_tasks",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "json"
    },
    {
      "hidden": false,
      "id": "json907408884",
      "maxSize": 1,
      "name": "failed_tasks",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "json"
    }
  ],
  "indexes": [],
  "viewQuery": "SELECT\n  queue as id,\n  SUM(CASE WHEN failed IS '' THEN 1 ELSE 0 END) as pending_tasks,\n  SUM(CASE WHEN failed IS NOT '' THEN 1 ELSE 0 END) as failed_tasks\nFROM queue_tasks\nGROUP BY queue;"
};
    const collectionCreateData = {
  "id": "ronp4q37zviiby1",
  "name": "queue_stats",
  "type": "view",
  "system": false,
  "listRule": null,
  "viewRule": null,
  "createRule": null,
  "updateRule": null,
  "deleteRule": null,
  "fields": [
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text3208210256",
      "max": 0,
      "min": 0,
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
      "id": "json3486377887",
      "maxSize": 1,
      "name": "pending_tasks",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "json"
    },
    {
      "hidden": false,
      "id": "json907408884",
      "maxSize": 1,
      "name": "failed_tasks",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "json"
    }
  ],
  "indexes": [],
  "viewQuery": "SELECT\n  queue as id,\n  SUM(CASE WHEN failed IS '' THEN 1 ELSE 0 END) as pending_tasks,\n  SUM(CASE WHEN failed IS NOT '' THEN 1 ELSE 0 END) as failed_tasks\nFROM queue_tasks\nGROUP BY queue;"
};
    const collectionUpdateData = {
  "name": "queue_stats",
  "type": "view",
  "system": false,
  "listRule": null,
  "viewRule": null,
  "createRule": null,
  "updateRule": null,
  "deleteRule": null,
  "fields": [
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text3208210256",
      "max": 0,
      "min": 0,
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
      "id": "json3486377887",
      "maxSize": 1,
      "name": "pending_tasks",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "json"
    },
    {
      "hidden": false,
      "id": "json907408884",
      "maxSize": 1,
      "name": "failed_tasks",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "json"
    }
  ],
  "indexes": [],
  "viewQuery": "SELECT\n  queue as id,\n  SUM(CASE WHEN failed IS '' THEN 1 ELSE 0 END) as pending_tasks,\n  SUM(CASE WHEN failed IS NOT '' THEN 1 ELSE 0 END) as failed_tasks\nFROM queue_tasks\nGROUP BY queue;"
};

    let collection = null;
    try {
        collection = app.findCollectionByNameOrId("ronp4q37zviiby1");
    } catch (_) {
        collection = null;
    }

    if (!collection) {
        try {
            collection = app.findCollectionByNameOrId("queue_stats");
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
        const collection = app.findCollectionByNameOrId("ronp4q37zviiby1");
        return app.delete(collection);
    } catch (_) {
        try {
            const collection = app.findCollectionByNameOrId("queue_stats");
            return app.delete(collection);
        } catch (_) {
            return null;
        }
    }
})
