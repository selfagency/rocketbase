/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3523882650")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_L5QMSnxtdd` ON `portfolio` (`slug`)"
    ],
    "name": "portfolio"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3523882650")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_L5QMSnxtdd` ON `portfolio_items` (`slug`)"
    ],
    "name": "portfolio_items"
  }, collection)

  return app.save(collection)
})
