/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "mfa": {
      "enabled": true,
      "rule": "@request.auth.role = \"admin\" || @request.auth.role = \"editor\" || @request.auth.role = \"contributor\""
    },
    "otp": {
      "enabled": true
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "mfa": {
      "enabled": false,
      "rule": ""
    },
    "otp": {
      "enabled": false
    }
  }, collection)

  return app.save(collection)
})
