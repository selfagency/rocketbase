/// <reference path="../../pb_data/types.d.ts" />
migrate(
  app => {
    const collectionData = {
      id: 'pbc_700096677',
      name: 'snapshots',
      type: 'base',
      system: false,
      listRule: '@request.auth.id = editor.id',
      viewRule: '@request.auth.id = editor.id',
      createRule: '@request.auth.id = editor.id',
      updateRule: '@request.auth.id = editor.id',
      deleteRule: '@request.auth.id = editor.id',
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
          id: 'text1363760893',
          max: 0,
          min: 0,
          name: 'collection_id',
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
          id: 'text2166717789',
          max: 0,
          min: 0,
          name: 'record_id',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text',
        },
        {
          cascadeDelete: false,
          collectionId: '_pb_users_auth_',
          hidden: false,
          id: 'relation3438408122',
          maxSelect: 1,
          minSelect: 0,
          name: 'editor',
          presentable: false,
          required: false,
          system: false,
          type: 'relation',
        },
        {
          hidden: false,
          id: 'json743249205',
          maxSize: 0,
          name: 'snapshot',
          presentable: false,
          required: false,
          system: false,
          type: 'json',
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
      indexes: [],
    };
    const collectionCreateData = {
      id: 'pbc_700096677',
      name: 'snapshots',
      type: 'base',
      system: false,
      listRule: '@request.auth.id = editor.id',
      viewRule: '@request.auth.id = editor.id',
      createRule: '@request.auth.id = editor.id',
      updateRule: '@request.auth.id = editor.id',
      deleteRule: '@request.auth.id = editor.id',
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
          id: 'text1363760893',
          max: 0,
          min: 0,
          name: 'collection_id',
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
          id: 'text2166717789',
          max: 0,
          min: 0,
          name: 'record_id',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text',
        },
        {
          cascadeDelete: false,
          collectionId: '_pb_users_auth_',
          hidden: false,
          id: 'relation3438408122',
          maxSelect: 1,
          minSelect: 0,
          name: 'editor',
          presentable: false,
          required: false,
          system: false,
          type: 'relation',
        },
        {
          hidden: false,
          id: 'json743249205',
          maxSize: 0,
          name: 'snapshot',
          presentable: false,
          required: false,
          system: false,
          type: 'json',
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
      indexes: [],
    };
    const collectionUpdateData = {
      name: 'snapshots',
      type: 'base',
      system: false,
      listRule: '@request.auth.id = editor.id',
      viewRule: '@request.auth.id = editor.id',
      createRule: '@request.auth.id = editor.id',
      updateRule: '@request.auth.id = editor.id',
      deleteRule: '@request.auth.id = editor.id',
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
          id: 'text1363760893',
          max: 0,
          min: 0,
          name: 'collection_id',
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
          id: 'text2166717789',
          max: 0,
          min: 0,
          name: 'record_id',
          pattern: '',
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: 'text',
        },
        {
          cascadeDelete: false,
          collectionId: '_pb_users_auth_',
          hidden: false,
          id: 'relation3438408122',
          maxSelect: 1,
          minSelect: 0,
          name: 'editor',
          presentable: false,
          required: false,
          system: false,
          type: 'relation',
        },
        {
          hidden: false,
          id: 'json743249205',
          maxSize: 0,
          name: 'snapshot',
          presentable: false,
          required: false,
          system: false,
          type: 'json',
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
      indexes: [],
    };

    let collection = null;
    try {
      collection = app.findCollectionByNameOrId('pbc_700096677');
    } catch (_) {
      collection = null;
    }

    if (!collection) {
      try {
        collection = app.findCollectionByNameOrId('snapshots');
      } catch (_) {
        collection = null;
      }
    }

    if (collection) {
      unmarshal(collectionUpdateData, collection);
      return app.save(collection);
    }

    collection = new Collection(collectionCreateData as any);
    const createResult = app.save(collection);

    if (false) {
      unmarshal(collectionUpdateData, collection);
      return app.save(collection);
    }

    return createResult;
  },
  app => {
    try {
      const collection = app.findCollectionByNameOrId('pbc_700096677');
      return app.delete(collection);
    } catch (_) {
      try {
        const collection = app.findCollectionByNameOrId('snapshots');
        return app.delete(collection);
      } catch (_) {
        return null;
      }
    }
  }
);
