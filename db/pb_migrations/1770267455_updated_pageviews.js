/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2939819742")

  // update collection data
  unmarshal({
    "createRule": "@request.headers.service_key = \"dfbe2cb7-e66f-4def-bca3-768745e98a6d\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2939819742")

  // update collection data
  unmarshal({
    "createRule": ""
  }, collection)

  return app.save(collection)
})
