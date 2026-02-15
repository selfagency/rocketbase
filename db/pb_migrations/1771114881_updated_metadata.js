/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_257584141")

  // add field
  collection.fields.addAt(1, new Field({
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
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_257584141")

  // remove field
  collection.fields.removeById("text2588918937")

  return app.save(collection)
})
