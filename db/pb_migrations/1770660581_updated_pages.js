/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3945946014")

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "select4232930610",
    "maxSelect": 1,
    "name": "collection",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "posts",
      "tags"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3945946014")

  // remove field
  collection.fields.removeById("select4232930610")

  return app.save(collection)
})
