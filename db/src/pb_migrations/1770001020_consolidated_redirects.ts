/// <reference path="../../pb_data/types.d.ts" />
migrate(
  app => {
    const collectionData = {
      id: 'pbc_3545947213',
      name: 'redirects',
      type: 'base',
      system: false,
      listRule: '',
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
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
          id: 'text2560465762',
          max: 0,
          min: 0,
          name: 'slug',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text',
        },
        {
          exceptDomains: null,
          hidden: false,
          id: 'url4101391790',
          name: 'url',
          onlyDomains: null,
          presentable: false,
          required: false,
          system: false,
          type: 'url',
        },
        {
          hidden: false,
          id: 'autodate3332085495',
          name: 'updated',
          onCreate: true,
          onUpdate: true,
          presentable: false,
          system: false,
          type: 'autodate',
        },
      ],
      indexes: ['CREATE UNIQUE INDEX `idx_yMisxd0qMt` ON `redirects` (`slug`)'],
    };
    const collectionCreateData = {
      id: 'pbc_3545947213',
      name: 'redirects',
      type: 'base',
      system: false,
      listRule: '',
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
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
          id: 'text2560465762',
          max: 0,
          min: 0,
          name: 'slug',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text',
        },
        {
          exceptDomains: null,
          hidden: false,
          id: 'url4101391790',
          name: 'url',
          onlyDomains: null,
          presentable: false,
          required: false,
          system: false,
          type: 'url',
        },
        {
          hidden: false,
          id: 'autodate3332085495',
          name: 'updated',
          onCreate: true,
          onUpdate: true,
          presentable: false,
          system: false,
          type: 'autodate',
        },
      ],
      indexes: ['CREATE UNIQUE INDEX `idx_yMisxd0qMt` ON `redirects` (`slug`)'],
    };
    const collectionUpdateData = {
      name: 'redirects',
      type: 'base',
      system: false,
      listRule: '',
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
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
          id: 'text2560465762',
          max: 0,
          min: 0,
          name: 'slug',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text',
        },
        {
          exceptDomains: null,
          hidden: false,
          id: 'url4101391790',
          name: 'url',
          onlyDomains: null,
          presentable: false,
          required: false,
          system: false,
          type: 'url',
        },
        {
          hidden: false,
          id: 'autodate3332085495',
          name: 'updated',
          onCreate: true,
          onUpdate: true,
          presentable: false,
          system: false,
          type: 'autodate',
        },
      ],
      indexes: ['CREATE UNIQUE INDEX `idx_yMisxd0qMt` ON `redirects` (`slug`)'],
    };

    let collection = null;
    try {
      collection = app.findCollectionByNameOrId('pbc_3545947213');
    } catch (_) {
      collection = null;
    }

    if (!collection) {
      try {
        collection = app.findCollectionByNameOrId('redirects');
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

    if (false) {
      unmarshal(collectionUpdateData, collection);
      return app.save(collection);
    }

    return createResult;
  },
  app => {
    try {
      const collection = app.findCollectionByNameOrId('pbc_3545947213');
      return app.delete(collection);
    } catch (_) {
      try {
        const collection = app.findCollectionByNameOrId('redirects');
        return app.delete(collection);
      } catch (_) {
        return null;
      }
    }
  }
);
