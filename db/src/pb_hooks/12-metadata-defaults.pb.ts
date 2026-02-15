/// <reference path="../../pb_data/types.d.ts" />

var DEFAULT_METADATA = [
  {
    key: 'site_title',
    nice_name: 'Site title',
    value: 'Rocketbase',
    type: 'string',
  },
  {
    key: 'site_description',
    nice_name: 'Site description',
    value: 'A production-ready full-stack application built with PocketBase and SvelteKit',
    type: 'string',
  },
  {
    key: 'site_logo',
    nice_name: 'Site logo',
    value: '',
    type: 'string',
  },
  {
    key: 'og_image',
    nice_name: 'Default social media image',
    value: '',
    type: 'string',
  },
  {
    key: 'fediverse_handle',
    nice_name: 'Fediverse handle',
    value: '',
    type: 'string',
  },
  {
    key: 'fediverse_username',
    nice_name: 'Fediverse username',
    value: '',
    type: 'string',
  },
  {
    key: 'bluesky_handle',
    nice_name: 'BlueSky username',
    value: '',
    type: 'string',
  },
  {
    key: 'cdn_url',
    nice_name: 'Content Delivery Network URL',
    value: '',
    type: 'string',
  },
  {
    key: 'admin_posts_per_page',
    nice_name: 'Admin posts per page',
    value: '12',
    type: 'integer',
  },
  {
    key: 'posts_per_page',
    nice_name: 'Posts per page',
    value: '12',
    type: 'integer',
  },
  {
    key: 'revisions_kept',
    nice_name: 'Revisions to keep',
    value: '-1',
    type: 'integer',
  },
  {
    key: 'comments_enabled',
    nice_name: 'Enable comments',
    value: 'true',
    type: 'boolean',
  },
  {
    key: 'custom_css',
    nice_name: 'Custom CSS',
    value: '',
    type: 'code',
  },
  {
    key: 'js_tags',
    nice_name: 'JavaScript tags',
    value: '',
    type: 'code',
  },
];

type MetadataDefault = {
  key: string;
  nice_name: string;
  value: string;
  type: string;
};

function isBlank(value: any) {
  return value === null || value === undefined || toString(value).trim() === '';
}

function findDefaultMetadataByKey(key: string): MetadataDefault | null {
  for (var i = 0; i < DEFAULT_METADATA.length; i++) {
    var defaults = DEFAULT_METADATA[i] as MetadataDefault | undefined;
    if (defaults && defaults.key === key) {
      return defaults;
    }
  }

  return null;
}

function patchMetadataRecordWithDefaults(record: any, defaults: MetadataDefault | null): boolean {
  if (!record || !defaults) {
    return false;
  }

  var changed = false;

  if (isBlank(record.get('type'))) {
    record.set('type', defaults.type);
    changed = true;
  }

  if (record.get('value') === null || record.get('value') === undefined) {
    record.set('value', defaults.value);
    changed = true;
  }

  if (isBlank(record.get('nice_name'))) {
    record.set('nice_name', defaults.nice_name);
    changed = true;
  }

  return changed;
}

onRecordValidate(function (e) {
  try {
    if (!e.record) {
      e.next();
      return;
    }

    var key = toString(e.record.get('key') || '');
    var defaults = findDefaultMetadataByKey(key);

    if (defaults) {
      patchMetadataRecordWithDefaults(e.record, defaults);
    }
  } catch (err) {
    console.error('[Hooks] metadata record default patch failed: ' + String(err));
  }

  e.next();
}, 'metadata');

console.log('[Hooks] Metadata defaults initialized');
