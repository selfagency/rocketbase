/// <reference path="../pb_data/types.d.ts" />
migrate(
  app => {
    const collection = new Collection({
      id: 'pbc_3056106000',
      created: '2026-02-16 00:00:00.000Z',
      updated: '2026-02-16 00:00:00.000Z',
      name: 'faqs',
      type: 'base',
      system: false,
      listRule: 'is_published = true',
      viewRule: 'is_published = true',
      createRule: '@request.auth.role = "admin" || @request.auth.collectionName = "_superusers"',
      updateRule: '@request.auth.role = "admin" || @request.auth.collectionName = "_superusers"',
      deleteRule: '@request.auth.role = "admin" || @request.auth.collectionName = "_superusers"',
      fields: [
        {
          hidden: false,
          id: 'text136010001',
          name: 'question',
          type: 'text',
          required: true,
          presentable: true,
          unique: false,
          options: {
            min: null,
            max: null,
            pattern: '',
          },
        },
        {
          hidden: false,
          id: 'editor136010002',
          name: 'answer',
          type: 'editor',
          required: true,
          presentable: false,
          options: {
            convertUrls: false,
          },
        },
        {
          hidden: false,
          id: 'text136010003',
          name: 'slug',
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
        {
          hidden: false,
          id: 'text136010004',
          name: 'category',
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
        {
          hidden: false,
          id: 'number136010005',
          name: 'sort_order',
          type: 'number',
          required: false,
          presentable: false,
          options: {
            min: null,
            max: null,
            noDecimal: true,
          },
        },
        {
          hidden: false,
          id: 'bool136010006',
          name: 'is_published',
          type: 'bool',
          required: false,
          presentable: false,
        },
        {
          hidden: false,
          id: 'text136010007',
          name: 'locale',
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
        {
          hidden: false,
          id: 'autodate136010008',
          name: 'created',
          type: 'autodate',
          required: false,
          presentable: false,
          onCreate: true,
          onUpdate: false,
        },
        {
          hidden: false,
          id: 'autodate136010009',
          name: 'updated',
          type: 'autodate',
          required: false,
          presentable: false,
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: [
        'CREATE INDEX `idx_faqs_published_sort` ON `faqs` (`is_published`, `sort_order`, `created`)',
        'CREATE UNIQUE INDEX `idx_faqs_slug_locale` ON `faqs` (`slug`, `locale`) WHERE `slug` != ""',
      ],
    });

    return app.save(collection);
  },
  app => {
    const collection = app.findCollectionByNameOrId('pbc_3056106000');

    return app.delete(collection);
  }
);
