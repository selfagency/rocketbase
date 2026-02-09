/// <reference path="../.types/pocketbase.d.ts" />
migrate(
  app => {
    const collection = new Collection({
      id: 'v2i9s97ijtkb6as',
      name: 'queue_locks',
      type: 'base',
      system: false,
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      options: {},
      fields: [
        {
          system: false,
          id: 'gb9nqipq',
          name: 'worker_id',
          type: 'text',
          required: true,
          presentable: false,
          unique: false,
          options: {
            min: null,
            max: null,
            pattern: '',
          },
        },
        {
          system: false,
          id: 'of2tn7ct',
          name: 'task',
          type: 'relation',
          required: true,
          presentable: false,
          unique: false,
          maxSelect: 1,
          collectionId: 'qgf0f8rtdk0s6pq',
          cascadeDelete: false,
        },
      ],
    });

    app.save(collection);

    // Create indexes after collection is saved (system fields like created are now available)
    app.db().newQuery('CREATE UNIQUE INDEX "idx_SKtU4DZ" ON "queue_locks" ("task")').execute();
    app.db().newQuery('CREATE INDEX "idx_GpAPmOu" ON "queue_locks" ("created")').execute();
  },
  app => {
    const collection = app.findCollectionByNameOrId('v2i9s97ijtkb6as');
    return app.delete(collection);
  }
);
