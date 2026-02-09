/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3615662572")

  // update collection data
  unmarshal({
    "createRule": "\"@request.headers.x-service-key\" = \"dfbe2cb7-e66f-4def-bca3-768745e98a6d\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3615662572")

  // update collection data
  unmarshal({
    "createRule": "@request.headers.servicekey = \"dfbe2cb7-e66f-4def-bca3-768745e98a6d\""
  }, collection)

  return app.save(collection)
})
