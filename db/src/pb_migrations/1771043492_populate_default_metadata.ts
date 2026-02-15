/// <reference path="../../pb_data/types.d.ts" />
migrate(
  app => {
    // Default site metadata for SEO
    const defaultMetadata = [
      {
        key: 'site_title',
        value: 'Rocketbase',
        type: 'string',
      },
      {
        key: 'site_description',
        value: 'A production-ready full-stack application built with PocketBase and SvelteKit',
        type: 'string',
      },
      {
        key: 'og_image',
        value: '',
        type: 'string',
      },
      {
        key: 'fediverse_handle',
        value: '',
        type: 'string',
      },
      {
        key: 'bluesky_handle',
        value: '',
        type: 'string',
      },
      {
        key: 'cdn_url',
        value: '',
        type: 'string',
      },
    ];

    const collection = app.findCollectionByNameOrId('metadata');

    // Insert each metadata entry
    for (const meta of defaultMetadata) {
      try {
        // Try to find existing record
        const records = app.findRecordsByFilter(collection.id, `key = "${meta.key}"`, '', 1, 0);

        if (records.length === 0) {
          // Create new record
          const record = new Record(collection);
          record.set('key', meta.key);
          record.set('value', meta.value);
          record.set('type', meta.type);
          app.save(record);
        }
      } catch (e) {
        console.error('Error inserting metadata:', meta.key, e);
      }
    }
  },
  app => {
    // Delete the default metadata entries on rollback
    const keys = ['site_title', 'site_description', 'og_image', 'fediverse_handle', 'bluesky_handle', 'cdn_url'];

    const collection = app.findCollectionByNameOrId('metadata');

    for (const key of keys) {
      try {
        const records = app.findRecordsByFilter(collection.id, `key = "${key}"`, '', 1, 0);

        for (const record of records) {
          app.delete(record);
        }
      } catch (e) {
        console.error('Error deleting metadata:', key, e);
      }
    }
  }
);
