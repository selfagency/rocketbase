/// <reference path="../../pb_data/types.d.ts" />
migrate(
  app => {
    const collectionData = {
      id: 'pbc_1219621782',
      name: 'tags',
      type: 'base',
      system: false,
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.role = "admin" || @request.auth.role = "editor"',
      updateRule: '@request.auth.role = "admin" || @request.auth.role = "editor"',
      deleteRule: '@request.auth.role = "admin" || @request.auth.role = "editor"',
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
          id: 'text59357059',
          max: 0,
          min: 0,
          name: 'tag',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
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
      indexes: ['CREATE UNIQUE INDEX `idx_maa9au6cG1` ON `tags` (`slug`)'],
    };
    const collectionCreateData = {
      id: 'pbc_1219621782',
      name: 'tags',
      type: 'base',
      system: false,
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.role = "admin" || @request.auth.role = "editor"',
      updateRule: '@request.auth.role = "admin" || @request.auth.role = "editor"',
      deleteRule: '@request.auth.role = "admin" || @request.auth.role = "editor"',
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
          id: 'text59357059',
          max: 0,
          min: 0,
          name: 'tag',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
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
      indexes: ['CREATE UNIQUE INDEX `idx_maa9au6cG1` ON `tags` (`slug`)'],
    };
    const collectionUpdateData = {
      name: 'tags',
      type: 'base',
      system: false,
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.role = "admin" || @request.auth.role = "editor"',
      updateRule: '@request.auth.role = "admin" || @request.auth.role = "editor"',
      deleteRule: '@request.auth.role = "admin" || @request.auth.role = "editor"',
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
          id: 'text59357059',
          max: 0,
          min: 0,
          name: 'tag',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
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
      indexes: ['CREATE UNIQUE INDEX `idx_maa9au6cG1` ON `tags` (`slug`)'],
    };

    let collection = null;
    try {
      collection = app.findCollectionByNameOrId('pbc_1219621782');
    } catch (_) {
      collection = null;
    }

    if (!collection) {
      try {
        collection = app.findCollectionByNameOrId('tags');
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
      const collection = app.findCollectionByNameOrId('pbc_1219621782');
      return app.delete(collection);
    } catch (_) {
      try {
        const collection = app.findCollectionByNameOrId('tags');
        return app.delete(collection);
      } catch (_) {
        return null;
      }
    }
  }
);
