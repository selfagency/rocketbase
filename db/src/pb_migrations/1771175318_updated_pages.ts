/// <reference path="../../pb_data/types.d.ts" />
migrate(
  app => {
    const collection = app.findCollectionByNameOrId('pbc_3945946014');

    // update field
    collection.fields.addAt(
      15,
      new Field({
        hidden: false,
        id: 'select4232930610',
        maxSelect: 1,
        name: 'collection',
        presentable: false,
        required: false,
        system: false,
        type: 'select',
        values: ['posts', 'tags', 'users', 'portfolio'],
      } as any)
    );

    return app.save(collection);
  },
  app => {
    const collection = app.findCollectionByNameOrId('pbc_3945946014');

    // update field
    collection.fields.addAt(
      15,
      new Field({
        hidden: false,
        id: 'select4232930610',
        maxSelect: 1,
        name: 'collection',
        presentable: false,
        required: false,
        system: false,
        type: 'select',
        values: ['posts', 'tags', 'users'],
      } as any)
    );

    return app.save(collection);
  }
);
