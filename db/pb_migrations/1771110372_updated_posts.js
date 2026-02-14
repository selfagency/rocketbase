/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1125843985")

  // update collection data
  unmarshal({
    "listRule": "published = 1 || @request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && author.id = @request.auth.id)",
    "viewRule": "published = 1 || @request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && author.id = @request.auth.id)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1125843985")

  // update collection data
  unmarshal({
    "listRule": "published = 1",
    "viewRule": "published = 1"
  }, collection)

  return app.save(collection)
})
