/// <reference path="../../pb_data/types.d.ts" />
migrate(
  app => {
    const collection = app.findCollectionByNameOrId('pbc_257584141');

    // update field
    collection.fields.addAt(
      5,
      new Field({
        hidden: false,
        id: 'select1841317061',
        maxSelect: 1,
        name: 'group',
        presentable: false,
        required: false,
        system: false,
        type: 'select',
        values: ['general', 'editing', 'social_media', 'indieweb', 'customization', 'other'],
      } as any)
    );

    return app.save(collection);
  },
  app => {
    const collection = app.findCollectionByNameOrId('pbc_257584141');

    // update field
    collection.fields.addAt(
      5,
      new Field({
        hidden: false,
        id: 'select1841317061',
        maxSelect: 1,
        name: 'group',
        presentable: false,
        required: false,
        system: false,
        type: 'select',
        values: ['general', 'social_media', 'indieweb', 'customization', 'other'],
      } as any)
    );

    return app.save(collection);
  }
);
