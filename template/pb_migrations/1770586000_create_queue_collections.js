/// <reference path="../.types/pocketbase.d.ts" />
migrate(
  app => {
    const collection = new Collection({
      id: 'qgf0f8rtdk0s6pq',
      name: 'queue_tasks',
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
          id: 'kdzlqnxa',
          name: 'queue',
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
          id: 'odvdwps6',
          name: 'task',
          type: 'json',
          required: false,
          presentable: false,
          unique: false,
          options: {
            maxSize: 2000000,
          },
        },
        {
          system: false,
          id: 'lfsvih6z',
          name: 'failed',
          type: 'date',
          required: false,
          presentable: false,
          unique: false,
          options: {
            min: '',
            max: '',
          },
        },
        {
          system: false,
          id: 'h530uquw',
          name: 'failed_reason',
          type: 'text',
          required: false,
          presentable: false,
          unique: false,
          options: {
            min: null,
            max: null,
            pattern: '',
          },
        },
      ],
    });

    app.save(collection);

    // Create indexes after collection is saved (system fields like created/updated are now available)
    app.db().newQuery('CREATE INDEX "idx_jyHoldi" ON "queue_tasks" ("queue", "failed", "created")').execute();
    app.db().newQuery('CREATE INDEX "idx_TJTrLZe" ON "queue_tasks" ("failed", "updated")').execute();
  },
  app => {
    const collection = app.findCollectionByNameOrId('qgf0f8rtdk0s6pq');
    return app.delete(collection);
  }
);
