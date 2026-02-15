/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collectionData = {
  "id": "pbc_257584141",
  "name": "metadata",
  "type": "base",
  "system": false,
  "listRule": "",
  "viewRule": "",
  "createRule": "@request.auth.role = \"admin\"",
  "updateRule": "@request.auth.role = \"admin\"",
  "deleteRule": "@request.auth.role = \"admin\"",
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
      "id": "text2588918937",
      "max": 0,
      "min": 0,
      "name": "nice_name",
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
      "id": "text2324736937",
      "max": 0,
      "min": 0,
      "name": "key",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": true,
      "system": false,
      "type": "text"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text494360628",
      "max": 0,
      "min": 0,
      "name": "value",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "hidden": false,
      "id": "select2363381545",
      "maxSelect": 1,
      "name": "type",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "select",
      "values": [
        "string",
        "integer",
        "float",
        "json",
        "boolean",
        "code"
      ]
    },
    {
      "hidden": false,
      "id": "autodate3332085495",
      "name": "updated",
      "onCreate": true,
      "onUpdate": true,
      "presentable": false,
      "system": false,
      "type": "autodate"
    }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX `idx_sfyg4WhexB` ON `metadata` (`key`)"
  ]
};
    const collectionCreateData = {
  "id": "pbc_257584141",
  "name": "metadata",
  "type": "base",
  "system": false,
  "listRule": "",
  "viewRule": "",
  "createRule": "@request.auth.role = \"admin\"",
  "updateRule": "@request.auth.role = \"admin\"",
  "deleteRule": "@request.auth.role = \"admin\"",
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
      "id": "text2588918937",
      "max": 0,
      "min": 0,
      "name": "nice_name",
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
      "id": "text2324736937",
      "max": 0,
      "min": 0,
      "name": "key",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": true,
      "system": false,
      "type": "text"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text494360628",
      "max": 0,
      "min": 0,
      "name": "value",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "hidden": false,
      "id": "select2363381545",
      "maxSelect": 1,
      "name": "type",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "select",
      "values": [
        "string",
        "integer",
        "float",
        "json",
        "boolean",
        "code"
      ]
    },
    {
      "hidden": false,
      "id": "autodate3332085495",
      "name": "updated",
      "onCreate": true,
      "onUpdate": true,
      "presentable": false,
      "system": false,
      "type": "autodate"
    }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX `idx_sfyg4WhexB` ON `metadata` (`key`)"
  ]
};
    const collectionUpdateData = {
  "name": "metadata",
  "type": "base",
  "system": false,
  "listRule": "",
  "viewRule": "",
  "createRule": "@request.auth.role = \"admin\"",
  "updateRule": "@request.auth.role = \"admin\"",
  "deleteRule": "@request.auth.role = \"admin\"",
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
      "id": "text2588918937",
      "max": 0,
      "min": 0,
      "name": "nice_name",
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
      "id": "text2324736937",
      "max": 0,
      "min": 0,
      "name": "key",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": true,
      "system": false,
      "type": "text"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text494360628",
      "max": 0,
      "min": 0,
      "name": "value",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "hidden": false,
      "id": "select2363381545",
      "maxSelect": 1,
      "name": "type",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "select",
      "values": [
        "string",
        "integer",
        "float",
        "json",
        "boolean",
        "code"
      ]
    },
    {
      "hidden": false,
      "id": "autodate3332085495",
      "name": "updated",
      "onCreate": true,
      "onUpdate": true,
      "presentable": false,
      "system": false,
      "type": "autodate"
    }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX `idx_sfyg4WhexB` ON `metadata` (`key`)"
  ]
};

    let collection = null;
    try {
        collection = app.findCollectionByNameOrId("pbc_257584141");
    } catch (_) {
        collection = null;
    }

    if (!collection) {
        try {
            collection = app.findCollectionByNameOrId("metadata");
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
        const collection = app.findCollectionByNameOrId("pbc_257584141");
        return app.delete(collection);
    } catch (_) {
        try {
            const collection = app.findCollectionByNameOrId("metadata");
            return app.delete(collection);
        } catch (_) {
            return null;
        }
    }
})
