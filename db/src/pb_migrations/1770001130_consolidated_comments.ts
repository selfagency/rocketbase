/// <reference path="../../pb_data/types.d.ts" />
migrate(
  app => {
    const collectionData = {
      id: 'pbc_533777971',
      name: 'comments',
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
          cascadeDelete: false,
          collectionId: 'pbc_1125843985',
          hidden: false,
          id: 'relation1519021197',
          maxSelect: 1,
          minSelect: 0,
          name: 'post',
          presentable: false,
          required: false,
          system: false,
          type: 'relation',
        },
        {
          cascadeDelete: false,
          collectionId: '_pb_users_auth_',
          hidden: false,
          id: 'relation3182418120',
          maxSelect: 1,
          minSelect: 0,
          name: 'author',
          presentable: false,
          required: false,
          system: false,
          type: 'relation',
        },
        {
          convertURLs: false,
          hidden: false,
          id: 'editor2490651244',
          maxSize: 0,
          name: 'comment',
          presentable: false,
          required: false,
          system: false,
          type: 'editor',
        },
        {
          cascadeDelete: false,
          collectionId: 'pbc_533777971',
          hidden: false,
          id: 'relation1853530023',
          maxSelect: 1,
          minSelect: 0,
          name: 'replyTo',
          presentable: false,
          required: false,
          system: false,
          type: 'relation',
        },
        {
          hidden: false,
          id: 'select2063623452',
          maxSelect: 1,
          name: 'status',
          presentable: false,
          required: false,
          system: false,
          type: 'select',
          values: ['approved', 'unapproved', 'abuse', 'spam'],
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
      id: 'pbc_533777971',
      name: 'comments',
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
          cascadeDelete: false,
          collectionId: 'pbc_1125843985',
          hidden: false,
          id: 'relation1519021197',
          maxSelect: 1,
          minSelect: 0,
          name: 'post',
          presentable: false,
          required: false,
          system: false,
          type: 'relation',
        },
        {
          cascadeDelete: false,
          collectionId: '_pb_users_auth_',
          hidden: false,
          id: 'relation3182418120',
          maxSelect: 1,
          minSelect: 0,
          name: 'author',
          presentable: false,
          required: false,
          system: false,
          type: 'relation',
        },
        {
          convertURLs: false,
          hidden: false,
          id: 'editor2490651244',
          maxSize: 0,
          name: 'comment',
          presentable: false,
          required: false,
          system: false,
          type: 'editor',
        },
        {
          hidden: false,
          id: 'select2063623452',
          maxSelect: 1,
          name: 'status',
          presentable: false,
          required: false,
          system: false,
          type: 'select',
          values: ['approved', 'unapproved', 'abuse', 'spam'],
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
      name: 'comments',
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
          cascadeDelete: false,
          collectionId: 'pbc_1125843985',
          hidden: false,
          id: 'relation1519021197',
          maxSelect: 1,
          minSelect: 0,
          name: 'post',
          presentable: false,
          required: false,
          system: false,
          type: 'relation',
        },
        {
          cascadeDelete: false,
          collectionId: '_pb_users_auth_',
          hidden: false,
          id: 'relation3182418120',
          maxSelect: 1,
          minSelect: 0,
          name: 'author',
          presentable: false,
          required: false,
          system: false,
          type: 'relation',
        },
        {
          convertURLs: false,
          hidden: false,
          id: 'editor2490651244',
          maxSize: 0,
          name: 'comment',
          presentable: false,
          required: false,
          system: false,
          type: 'editor',
        },
        {
          cascadeDelete: false,
          collectionId: 'pbc_533777971',
          hidden: false,
          id: 'relation1853530023',
          maxSelect: 1,
          minSelect: 0,
          name: 'replyTo',
          presentable: false,
          required: false,
          system: false,
          type: 'relation',
        },
        {
          hidden: false,
          id: 'select2063623452',
          maxSelect: 1,
          name: 'status',
          presentable: false,
          required: false,
          system: false,
          type: 'select',
          values: ['approved', 'unapproved', 'abuse', 'spam'],
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
      collection = app.findCollectionByNameOrId('pbc_533777971');
    } catch (_) {
      collection = null;
    }

    if (!collection) {
      try {
        collection = app.findCollectionByNameOrId('comments');
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

    if (true) {
      unmarshal(collectionUpdateData, collection);
      return app.save(collection);
    }

    return createResult;
  },
  app => {
    try {
      const collection = app.findCollectionByNameOrId('pbc_533777971');
      return app.delete(collection);
    } catch (_) {
      try {
        const collection = app.findCollectionByNameOrId('comments');
        return app.delete(collection);
      } catch (_) {
        return null;
      }
    }
  }
);
