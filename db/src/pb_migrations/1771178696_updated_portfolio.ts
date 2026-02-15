/// <reference path="../../pb_data/types.d.ts" />
migrate(
  app => {
    const collection = app.findCollectionByNameOrId('pbc_3523882650');

    // add field
    collection.fields.addAt(
      11,
      new Field({
        hidden: false,
        id: 'bool1339925811',
        name: 'in_trash',
        presentable: false,
        required: false,
        system: false,
        type: 'bool',
      } as any)
    );

    return app.save(collection);
  },
  app => {
    const collection = app.findCollectionByNameOrId('pbc_3523882650');

    // remove field
    collection.fields.removeById('bool1339925811');

    return app.save(collection);
  }
);
