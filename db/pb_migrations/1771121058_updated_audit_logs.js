/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_audit_logs")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && user.id = @request.auth.id)",
    "deleteRule": "@request.auth.role = \"admin\"",
    "listRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && user.id = @request.auth.id)",
    "updateRule": "@request.auth.role = \"admin\"",
    "viewRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && user.id = @request.auth.id)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_audit_logs")

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
