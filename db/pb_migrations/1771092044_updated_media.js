/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2708086759")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && uploaded_by.id = @request.auth.id)",
    "updateRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && uploaded_by.id = @request.auth.id)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2708086759")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || @request.auth.role = \"contributor\"",
    "updateRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || @request.auth.role = \"contributor\""
  }, collection)

  return app.save(collection)
})
