/// <reference path="../pb_data/types.d.ts" />
migrate(
  app => {
    const queueTasks = new Collection({
      createRule: null,
      deleteRule: null,
      fields: [
        {
          hidden: false,
          id: 'kdzlqnxa',
          name: 'queue',
          type: 'text',
          required: true,
          presentable: false,
          system: false,
          min: null,
          max: null,
          pattern: '',
        },
        {
          hidden: false,
          id: 'odvdwps6',
          name: 'task',
          type: 'json',
          required: false,
          presentable: false,
          system: false,
          maxSize: 2000000,
        },
        {
          hidden: false,
          id: 'lfsvih6z',
          name: 'failed',
          type: 'date',
          required: false,
          presentable: false,
          system: false,
          min: '',
          max: '',
        },
        {
          hidden: false,
          id: 'h530uquw',
          name: 'failed_reason',
          type: 'text',
          required: false,
          presentable: false,
          system: false,
          min: null,
          max: null,
          pattern: '',
        },
        {
          hidden: false,
          id: 'autodate_created_queue_tasks',
          name: 'created',
          type: 'autodate',
          presentable: false,
          system: false,
          onCreate: true,
          onUpdate: false,
        },
        {
          hidden: false,
          id: 'autodate_updated_queue_tasks',
          name: 'updated',
          type: 'autodate',
          presentable: false,
          system: false,
          onCreate: false,
          onUpdate: true,
        },
      ],
      id: 'qgf0f8rtdk0s6pq',
      indexes: [],
      listRule: null,
      name: 'queue_tasks',
      system: false,
      type: 'base',
      updateRule: null,
      viewRule: null,
    });

    const queueLocks = new Collection({
      createRule: null,
      deleteRule: null,
      fields: [
        {
          hidden: false,
          id: 'gb9nqipq',
          name: 'worker_id',
          type: 'text',
          required: true,
          presentable: false,
          system: false,
          min: null,
          max: null,
          pattern: '',
        },
        {
          hidden: false,
          id: 'of2tn7ct',
          name: 'task',
          type: 'relation',
          required: true,
          presentable: false,
          system: false,
          collectionId: 'qgf0f8rtdk0s6pq',
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
          displayFields: null,
        },
        {
          hidden: false,
          id: 'autodate_created_queue_locks',
          name: 'created',
          type: 'autodate',
          presentable: false,
          system: false,
          onCreate: true,
          onUpdate: false,
        },
      ],
      id: 'v2i9s97ijtkb6as',
      indexes: [],
      listRule: null,
      name: 'queue_locks',
      system: false,
      type: 'base',
      updateRule: null,
      viewRule: null,
    });

    const queueStats = new Collection({
      createRule: null,
      deleteRule: null,
      fields: [
        {
          hidden: false,
          id: 'an0kocfc',
          name: 'pending_tasks',
          type: 'json',
          required: false,
          presentable: false,
          system: false,
          maxSize: 1,
        },
        {
          hidden: false,
          id: 'nnwglxhx',
          name: 'failed_tasks',
          type: 'json',
          required: false,
          presentable: false,
          system: false,
          maxSize: 1,
        },
      ],
      id: 'ronp4q37zviiby1',
      indexes: [],
      listRule: null,
      name: 'queue_stats',
      system: false,
      type: 'view',
      updateRule: null,
      viewRule: null,
      viewQuery:
        "SELECT\n  queue as id,\n  SUM(CASE WHEN failed IS '' THEN 1 ELSE 0 END) as pending_tasks,\n  SUM(CASE WHEN failed IS NOT '' THEN 1 ELSE 0 END) as failed_tasks\nFROM queue_tasks\nGROUP BY queue;",
    });

    app.save(queueTasks);
    app.save(queueLocks);
    app.save(queueStats);
  },
  app => {
    const queueStats = app.findCollectionByNameOrId('ronp4q37zviiby1');
    app.delete(queueStats);

    const queueLocks = app.findCollectionByNameOrId('v2i9s97ijtkb6as');
    app.delete(queueLocks);

    const queueTasks = app.findCollectionByNameOrId('qgf0f8rtdk0s6pq');
    app.delete(queueTasks);
  }
);
