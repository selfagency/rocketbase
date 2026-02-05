/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.role != \"\"",
    "deleteRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || @request.auth.role = \"contributor\"",
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
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation2375276105",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "user",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "select4232930610",
        "maxSelect": 1,
        "name": "collection",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "metadata",
          "pages",
          "posts",
          "redirects",
          "tags",
          "users"
        ]
      },
      {
        "hidden": false,
        "id": "select1204587666",
        "maxSelect": 1,
        "name": "action",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "create",
          "update",
          "delete"
        ]
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text237519976",
        "max": 0,
        "min": 0,
        "name": "entity",
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
        "id": "text1164986283",
        "max": 0,
        "min": 0,
        "name": "diff",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "autodate2862495610",
        "name": "date",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_1499349394",
    "indexes": [],
    "listRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || @request.auth.role = \"contributor\"",
    "name": "audit",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || @request.auth.role = \"contributor\""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1499349394");

  return app.delete(collection);
})
