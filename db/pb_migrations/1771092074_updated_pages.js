/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3945946014")

  // remove field
  collection.fields.removeById("file1781309708")

  // add field
  collection.fields.addAt(14, new Field({
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
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3945946014")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "file1781309708",
    "maxSelect": 99,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "media",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // remove field
  collection.fields.removeById("relation1204091606")

  return app.save(collection)
})
