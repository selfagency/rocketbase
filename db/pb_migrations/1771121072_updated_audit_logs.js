/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  let collection = null
  try {
    collection = app.findCollectionByNameOrId("pbc_audit_logs")
  } catch (_) {
    return
  }

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || @request.auth.role = \"contributor\""
  }, collection)

  return app.save(collection)
}, (app) => {
  let collection = null
  try {
    collection = app.findCollectionByNameOrId("pbc_audit_logs")
  } catch (_) {
    return
  }

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || (@request.auth.role = \"contributor\" && user.id = @request.auth.id)"
  }, collection)

  return app.save(collection)
})
