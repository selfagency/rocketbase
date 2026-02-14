/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1125843985")

  // remove field
  collection.fields.removeById("file1781309708")

  // add field
  collection.fields.addAt(6, new Field({
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

  // add field
  collection.fields.addAt(7, new Field({
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
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1125843985")

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

  // remove field
  collection.fields.removeById("text1203373331")

  return app.save(collection)
})
