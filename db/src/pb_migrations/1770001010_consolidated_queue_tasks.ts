/// <reference path="../../pb_data/types.d.ts" />
migrate(
  app => {
    const collectionData = {
      id: 'qgf0f8rtdk0s6pq',
      name: 'queue_tasks',
      type: 'base',
      system: false,
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text',
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'kdzlqnxa',
          max: 0,
          min: 0,
          name: 'queue',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: true,
          system: false,
          type: 'text',
        },
        {
          hidden: false,
          id: 'odvdwps6',
          maxSize: 2000000,
          name: 'task',
          presentable: false,
          required: false,
          system: false,
          type: 'json',
        },
        {
          hidden: false,
          id: 'lfsvih6z',
          max: '',
          min: '',
          name: 'failed',
          presentable: false,
          required: false,
          system: false,
          type: 'date',
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'h530uquw',
          max: 0,
          min: 0,
          name: 'failed_reason',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text',
        },
        {
          hidden: false,
          id: 'autodate_created_queue_tasks',
          name: 'created',
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: 'autodate',
        },
        {
          hidden: false,
          id: 'autodate_updated_queue_tasks',
          name: 'updated',
          onCreate: false,
          onUpdate: true,
          presentable: false,
          system: false,
          type: 'autodate',
        },
      ],
      indexes: [
        'CREATE INDEX `idx_jyHoldi` ON `queue_tasks` (\n  `queue`,\n  `failed`,\n  `created`\n)',
        'CREATE INDEX `idx_TJTrLZe` ON `queue_tasks` (\n  `failed`,\n  `updated`\n)',
      ],
    };
    const collectionCreateData = {
      id: 'qgf0f8rtdk0s6pq',
      name: 'queue_tasks',
      type: 'base',
      system: false,
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text',
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'kdzlqnxa',
          max: 0,
          min: 0,
          name: 'queue',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: true,
          system: false,
          type: 'text',
        },
        {
          hidden: false,
          id: 'odvdwps6',
          maxSize: 2000000,
          name: 'task',
          presentable: false,
          required: false,
          system: false,
          type: 'json',
        },
        {
          hidden: false,
          id: 'lfsvih6z',
          max: '',
          min: '',
          name: 'failed',
          presentable: false,
          required: false,
          system: false,
          type: 'date',
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'h530uquw',
          max: 0,
          min: 0,
          name: 'failed_reason',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text',
        },
        {
          hidden: false,
          id: 'autodate_created_queue_tasks',
          name: 'created',
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: 'autodate',
        },
        {
          hidden: false,
          id: 'autodate_updated_queue_tasks',
          name: 'updated',
          onCreate: false,
          onUpdate: true,
          presentable: false,
          system: false,
          type: 'autodate',
        },
      ],
      indexes: [
        'CREATE INDEX `idx_jyHoldi` ON `queue_tasks` (\n  `queue`,\n  `failed`,\n  `created`\n)',
        'CREATE INDEX `idx_TJTrLZe` ON `queue_tasks` (\n  `failed`,\n  `updated`\n)',
      ],
    };
    const collectionUpdateData = {
      name: 'queue_tasks',
      type: 'base',
      system: false,
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          autogeneratePattern: '[a-z0-9]{15}',
          hidden: false,
          id: 'text3208210256',
          max: 15,
          min: 15,
          name: 'id',
          pattern: '^[a-z0-9]+$',
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: 'text',
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'kdzlqnxa',
          max: 0,
          min: 0,
          name: 'queue',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: true,
          system: false,
          type: 'text',
        },
        {
          hidden: false,
          id: 'odvdwps6',
          maxSize: 2000000,
          name: 'task',
          presentable: false,
          required: false,
          system: false,
          type: 'json',
        },
        {
          hidden: false,
          id: 'lfsvih6z',
          max: '',
          min: '',
          name: 'failed',
          presentable: false,
          required: false,
          system: false,
          type: 'date',
        },
        {
          autogeneratePattern: '',
          hidden: false,
          id: 'h530uquw',
          max: 0,
          min: 0,
          name: 'failed_reason',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text',
        },
        {
          hidden: false,
          id: 'autodate_created_queue_tasks',
          name: 'created',
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: 'autodate',
        },
        {
          hidden: false,
          id: 'autodate_updated_queue_tasks',
          name: 'updated',
          onCreate: false,
          onUpdate: true,
          presentable: false,
          system: false,
          type: 'autodate',
        },
      ],
      indexes: [
        'CREATE INDEX `idx_jyHoldi` ON `queue_tasks` (\n  `queue`,\n  `failed`,\n  `created`\n)',
        'CREATE INDEX `idx_TJTrLZe` ON `queue_tasks` (\n  `failed`,\n  `updated`\n)',
      ],
    };

    let collection = null;
    try {
      collection = app.findCollectionByNameOrId('qgf0f8rtdk0s6pq');
    } catch (_) {
      collection = null;
    }

    if (!collection) {
      try {
        collection = app.findCollectionByNameOrId('queue_tasks');
      } catch (_) {
        collection = null;
      }
    }

    if (collection) {
      unmarshal(collectionUpdateData, collection);
      return app.save(collection);
    }

    collection = new Collection(collectionCreateData);
    const createResult = app.save(collection);

    return createResult;
  },
  app => {
    try {
      const collection = app.findCollectionByNameOrId('qgf0f8rtdk0s6pq');
      return app.delete(collection);
    } catch (_) {
      try {
        const collection = app.findCollectionByNameOrId('queue_tasks');
        return app.delete(collection);
      } catch (_) {
        return null;
      }
    }
  }
);
