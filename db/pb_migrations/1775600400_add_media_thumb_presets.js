/// <reference path="../pb_data/types.d.ts" />

const THUMB_PRESETS = [
  '100x100',
  '480x0',
  '768x0',
  '1200x0',
  '1600x0',
  '1200x630f',
  '1200x675f',
  '1200x627f',
  '1080x1080f',
];

function updateFileFieldThumbs(collection, fieldId, thumbs) {
  collection.fields.removeById(fieldId);

  if (collection.name === 'media') {
    collection.fields.addAt(
      1,
      new Field({
        hidden: false,
        id: 'file2359244304',
        maxSelect: 1,
        maxSize: 0,
        mimeTypes: [],
        name: 'file',
        presentable: false,
        protected: false,
        required: false,
        system: false,
        thumbs,
        type: 'file',
      })
    );

    return;
  }

  if (collection.name === 'posts' || collection.name === 'pages') {
    collection.fields.addAt(
      5,
      new Field({
        hidden: false,
        id: 'file3309110367',
        maxSelect: 1,
        maxSize: 0,
        mimeTypes: [],
        name: 'image',
        presentable: false,
        protected: false,
        required: false,
        system: false,
        thumbs,
        type: 'file',
      })
    );
  }
}

migrate(
  app => {
    const media = app.findCollectionByNameOrId('pbc_2708086759');
    const posts = app.findCollectionByNameOrId('pbc_1125843985');
    const pages = app.findCollectionByNameOrId('pbc_3945946014');

    updateFileFieldThumbs(media, 'file2359244304', THUMB_PRESETS);
    updateFileFieldThumbs(posts, 'file3309110367', THUMB_PRESETS);
    updateFileFieldThumbs(pages, 'file3309110367', THUMB_PRESETS);

    app.save(media);
    app.save(posts);
    return app.save(pages);
  },
  app => {
    const media = app.findCollectionByNameOrId('pbc_2708086759');
    const posts = app.findCollectionByNameOrId('pbc_1125843985');
    const pages = app.findCollectionByNameOrId('pbc_3945946014');

    updateFileFieldThumbs(media, 'file2359244304', []);
    updateFileFieldThumbs(posts, 'file3309110367', []);
    updateFileFieldThumbs(pages, 'file3309110367', []);

    app.save(media);
    app.save(posts);
    return app.save(pages);
  }
);
