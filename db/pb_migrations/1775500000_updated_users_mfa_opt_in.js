/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "bool6310284917",
    "name": "mfaOptIn",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // update collection data
  unmarshal({
    "mfa": {
      "rule": "role = \"admin\" || role = \"editor\" || role = \"contributor\" || mfaOptIn = true"
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("bool6310284917")

  // update collection data
  unmarshal({
    "mfa": {
      "rule": "role = \"admin\" || role = \"editor\" || role = \"contributor\""
    }
  }, collection)

  return app.save(collection)
})
