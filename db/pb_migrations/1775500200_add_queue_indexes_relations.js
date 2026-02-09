/// <reference path="../pb_data/types.d.ts" />
migrate(
  app => {
    const queueLocks = app.findCollectionByNameOrId('v2i9s97ijtkb6as');

    // update collection: add relation options and indexes
    unmarshal(
      {
        fields: [
          {
            id: 'gb9nqipq',
            name: 'worker_id',
            type: 'text',
            required: true,
            presentable: false,
            system: false,
            hidden: false,
            min: null,
            max: null,
            pattern: '',
          },
          {
            id: 'of2tn7ct',
            name: 'task',
            type: 'relation',
            collectionId: 'qgf0f8rtdk0s6pq',
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
            required: true,
            presentable: false,
            system: false,
            hidden: false,
          },
          {
            id: 'autodate_created_queue_locks',
            name: 'created',
            type: 'autodate',
            presentable: false,
            system: false,
            hidden: false,
            onCreate: true,
            onUpdate: false,
          },
        ],
        indexes: [
          'CREATE UNIQUE INDEX `idx_SKtU4DZ` ON `queue_locks` (`task`)',
          'CREATE INDEX `idx_GpAPmOu` ON `queue_locks` (`created`)',
        ],
      },
      queueLocks
    );

    app.save(queueLocks);

    const queueTasks = app.findCollectionByNameOrId('qgf0f8rtdk0s6pq');

    // update collection: add indexes
    unmarshal(
      {
        indexes: [
          'CREATE INDEX `idx_jyHoldi` ON `queue_tasks` (\n  `queue`,\n  `failed`,\n  `created`\n)',
          'CREATE INDEX `idx_TJTrLZe` ON `queue_tasks` (\n  `failed`,\n  `updated`\n)',
        ],
      },
      queueTasks
    );

    app.save(queueTasks);
  },
  app => {
    const queueLocks = app.findCollectionByNameOrId('v2i9s97ijtkb6as');

    // revert relation options and indexes
    unmarshal(
      {
        fields: [
          {
            id: 'gb9nqipq',
            name: 'worker_id',
            type: 'text',
            required: true,
            presentable: false,
            system: false,
            hidden: false,
            min: null,
            max: null,
            pattern: '',
          },
          {
            id: 'of2tn7ct',
            name: 'task',
            type: 'relation',
            collectionId: 'qgf0f8rtdk0s6pq',
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
            required: true,
            presentable: false,
            system: false,
            hidden: false,
          },
          {
            id: 'autodate_created_queue_locks',
            name: 'created',
            type: 'autodate',
            presentable: false,
            system: false,
            hidden: false,
            onCreate: true,
            onUpdate: false,
          },
        ],
        indexes: [],
      },
      queueLocks
    );

    app.save(queueLocks);

    const queueTasks = app.findCollectionByNameOrId('qgf0f8rtdk0s6pq');

    unmarshal({ indexes: [] }, queueTasks);

    app.save(queueTasks);
  }
);
