/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collectionData = {
  "id": "pbc_1125843985",
  "name": "posts",
  "type": "base",
  "system": false,
  "listRule": "published = 1 || @request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && author.id = @request.auth.id)",
  "viewRule": "published = 1 || @request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && author.id = @request.auth.id)",
  "createRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || @request.auth.role = \"contributor\"",
  "updateRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && author.id = @request.auth.id)",
  "deleteRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && author.id = @request.auth.id)",
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
      "id": "text724990059",
      "max": 0,
      "min": 0,
      "name": "title",
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
      "id": "text2560465762",
      "max": 0,
      "min": 0,
      "name": "slug",
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
      "id": "text3458754147",
      "max": 0,
      "min": 0,
      "name": "summary",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "convertURLs": false,
      "hidden": false,
      "id": "editor4274335913",
      "maxSize": 0,
      "name": "content",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "editor"
    },
    {
      "hidden": false,
      "id": "file3309110367",
      "maxSelect": 1,
      "maxSize": 0,
      "mimeTypes": [],
      "name": "image",
      "presentable": false,
      "protected": false,
      "required": false,
      "system": false,
      "thumbs": [
        "100x100",
        "480x0",
        "768x0",
        "1200x0",
        "1600x0",
        "1200x630f",
        "1200x675f",
        "1200x627f",
        "1080x1080f"
      ],
      "type": "file"
    },
    {
      "cascadeDelete": false,
      "collectionId": "pbc_2708086759",
      "hidden": false,
      "id": "relation1204091606",
      "maxSelect": 999,
      "minSelect": 0,
      "name": "attachments",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "relation"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text1203373331",
      "max": 0,
      "min": 0,
      "name": "embed",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "exceptDomains": null,
      "hidden": false,
      "id": "url3774296163",
      "name": "enclosure",
      "onlyDomains": null,
      "presentable": false,
      "required": false,
      "system": false,
      "type": "url"
    },
    {
      "hidden": false,
      "id": "date2862495610",
      "max": "",
      "min": "",
      "name": "date",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "date"
    },
    {
      "cascadeDelete": false,
      "collectionId": "_pb_users_auth_",
      "hidden": false,
      "id": "relation3182418120",
      "maxSelect": 999,
      "minSelect": 0,
      "name": "author",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "relation"
    },
    {
      "cascadeDelete": false,
      "collectionId": "pbc_1219621782",
      "hidden": false,
      "id": "relation1874629670",
      "maxSelect": 999,
      "minSelect": 0,
      "name": "tags",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "relation"
    },
    {
      "hidden": false,
      "id": "bool1007901140",
      "name": "featured",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "bool1748787223",
      "name": "published",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "bool2058414169",
      "name": "visible",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "bool472388549",
      "name": "require_login",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "bool779820144",
      "name": "subscriber_only",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "bool1339925811",
      "name": "in_trash",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "autodate2990389176",
      "name": "created",
      "onCreate": true,
      "onUpdate": false,
      "presentable": false,
      "system": false,
      "type": "autodate"
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
    "CREATE UNIQUE INDEX `idx_s2R7n5BI7O` ON `posts` (`slug`)"
  ]
};
    const collectionCreateData = {
  "id": "pbc_1125843985",
  "name": "posts",
  "type": "base",
  "system": false,
  "listRule": "published = 1 || @request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && author.id = @request.auth.id)",
  "viewRule": "published = 1 || @request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && author.id = @request.auth.id)",
  "createRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || @request.auth.role = \"contributor\"",
  "updateRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && author.id = @request.auth.id)",
  "deleteRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && author.id = @request.auth.id)",
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
      "id": "text724990059",
      "max": 0,
      "min": 0,
      "name": "title",
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
      "id": "text2560465762",
      "max": 0,
      "min": 0,
      "name": "slug",
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
      "id": "text3458754147",
      "max": 0,
      "min": 0,
      "name": "summary",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "convertURLs": false,
      "hidden": false,
      "id": "editor4274335913",
      "maxSize": 0,
      "name": "content",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "editor"
    },
    {
      "hidden": false,
      "id": "file3309110367",
      "maxSelect": 1,
      "maxSize": 0,
      "mimeTypes": [],
      "name": "image",
      "presentable": false,
      "protected": false,
      "required": false,
      "system": false,
      "thumbs": [
        "100x100",
        "480x0",
        "768x0",
        "1200x0",
        "1600x0",
        "1200x630f",
        "1200x675f",
        "1200x627f",
        "1080x1080f"
      ],
      "type": "file"
    },
    {
      "cascadeDelete": false,
      "collectionId": "pbc_2708086759",
      "hidden": false,
      "id": "relation1204091606",
      "maxSelect": 999,
      "minSelect": 0,
      "name": "attachments",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "relation"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text1203373331",
      "max": 0,
      "min": 0,
      "name": "embed",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "exceptDomains": null,
      "hidden": false,
      "id": "url3774296163",
      "name": "enclosure",
      "onlyDomains": null,
      "presentable": false,
      "required": false,
      "system": false,
      "type": "url"
    },
    {
      "hidden": false,
      "id": "date2862495610",
      "max": "",
      "min": "",
      "name": "date",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "date"
    },
    {
      "cascadeDelete": false,
      "collectionId": "_pb_users_auth_",
      "hidden": false,
      "id": "relation3182418120",
      "maxSelect": 999,
      "minSelect": 0,
      "name": "author",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "relation"
    },
    {
      "cascadeDelete": false,
      "collectionId": "pbc_1219621782",
      "hidden": false,
      "id": "relation1874629670",
      "maxSelect": 999,
      "minSelect": 0,
      "name": "tags",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "relation"
    },
    {
      "hidden": false,
      "id": "bool1007901140",
      "name": "featured",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "bool1748787223",
      "name": "published",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "bool2058414169",
      "name": "visible",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "bool472388549",
      "name": "require_login",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "bool779820144",
      "name": "subscriber_only",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "bool1339925811",
      "name": "in_trash",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "autodate2990389176",
      "name": "created",
      "onCreate": true,
      "onUpdate": false,
      "presentable": false,
      "system": false,
      "type": "autodate"
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
    "CREATE UNIQUE INDEX `idx_s2R7n5BI7O` ON `posts` (`slug`)"
  ]
};
    const collectionUpdateData = {
  "name": "posts",
  "type": "base",
  "system": false,
  "listRule": "published = 1 || @request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && author.id = @request.auth.id)",
  "viewRule": "published = 1 || @request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && author.id = @request.auth.id)",
  "createRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || @request.auth.role = \"contributor\"",
  "updateRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && author.id = @request.auth.id)",
  "deleteRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && author.id = @request.auth.id)",
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
      "id": "text724990059",
      "max": 0,
      "min": 0,
      "name": "title",
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
      "id": "text2560465762",
      "max": 0,
      "min": 0,
      "name": "slug",
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
      "id": "text3458754147",
      "max": 0,
      "min": 0,
      "name": "summary",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "convertURLs": false,
      "hidden": false,
      "id": "editor4274335913",
      "maxSize": 0,
      "name": "content",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "editor"
    },
    {
      "hidden": false,
      "id": "file3309110367",
      "maxSelect": 1,
      "maxSize": 0,
      "mimeTypes": [],
      "name": "image",
      "presentable": false,
      "protected": false,
      "required": false,
      "system": false,
      "thumbs": [
        "100x100",
        "480x0",
        "768x0",
        "1200x0",
        "1600x0",
        "1200x630f",
        "1200x675f",
        "1200x627f",
        "1080x1080f"
      ],
      "type": "file"
    },
    {
      "cascadeDelete": false,
      "collectionId": "pbc_2708086759",
      "hidden": false,
      "id": "relation1204091606",
      "maxSelect": 999,
      "minSelect": 0,
      "name": "attachments",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "relation"
    },
    {
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text1203373331",
      "max": 0,
      "min": 0,
      "name": "embed",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    },
    {
      "exceptDomains": null,
      "hidden": false,
      "id": "url3774296163",
      "name": "enclosure",
      "onlyDomains": null,
      "presentable": false,
      "required": false,
      "system": false,
      "type": "url"
    },
    {
      "hidden": false,
      "id": "date2862495610",
      "max": "",
      "min": "",
      "name": "date",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "date"
    },
    {
      "cascadeDelete": false,
      "collectionId": "_pb_users_auth_",
      "hidden": false,
      "id": "relation3182418120",
      "maxSelect": 999,
      "minSelect": 0,
      "name": "author",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "relation"
    },
    {
      "cascadeDelete": false,
      "collectionId": "pbc_1219621782",
      "hidden": false,
      "id": "relation1874629670",
      "maxSelect": 999,
      "minSelect": 0,
      "name": "tags",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "relation"
    },
    {
      "hidden": false,
      "id": "bool1007901140",
      "name": "featured",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "bool1748787223",
      "name": "published",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "bool2058414169",
      "name": "visible",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "bool472388549",
      "name": "require_login",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "bool779820144",
      "name": "subscriber_only",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "bool1339925811",
      "name": "in_trash",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool"
    },
    {
      "hidden": false,
      "id": "autodate2990389176",
      "name": "created",
      "onCreate": true,
      "onUpdate": false,
      "presentable": false,
      "system": false,
      "type": "autodate"
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
    "CREATE UNIQUE INDEX `idx_s2R7n5BI7O` ON `posts` (`slug`)"
  ]
};

    let collection = null;
    try {
        collection = app.findCollectionByNameOrId("pbc_1125843985");
    } catch (_) {
        collection = null;
    }

    if (!collection) {
        try {
            collection = app.findCollectionByNameOrId("posts");
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
        const collection = app.findCollectionByNameOrId("pbc_1125843985");
        return app.delete(collection);
    } catch (_) {
        try {
            const collection = app.findCollectionByNameOrId("posts");
            return app.delete(collection);
        } catch (_) {
            return null;
        }
    }
})
