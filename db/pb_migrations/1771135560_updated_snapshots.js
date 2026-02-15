/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_700096677")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id = editor.id",
    "deleteRule": "@request.auth.id = editor.id",
    "listRule": "@request.auth.id = editor.id",
    "updateRule": "@request.auth.id = editor.id",
    "viewRule": "@request.auth.id = editor.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_700096677")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
