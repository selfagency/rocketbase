#!/usr/bin/env node

/**
 * Populate default site metadata for SEO
 *
 * This script populates the metadata collection with default values
 * for site title, description, and social media metadata.
 *
 * Usage: node populate-metadata.js
 */

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

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
    key: 'twitter_site',
    value: '',
    type: 'string',
  },
  {
    key: 'twitter_handle',
    value: '',
    type: 'string',
  },
];

async function populateMetadata() {
  console.log('Populating metadata collection...\n');

  for (const meta of defaultMetadata) {
    try {
      // Check if metadata already exists
      const existing = await pb.collection('metadata').getFirstListItem(`key="${meta.key}"`);
      console.log(`✓ Metadata "${meta.key}" already exists (value: "${existing.value}")`);
    } catch {
      // Not found, create new record
      try {
        await pb.collection('metadata').create(meta);
        console.log(`✓ Created metadata "${meta.key}" with value: "${meta.value}"`);
      } catch (createError) {
        console.error(`✗ Failed to create metadata "${meta.key}":`, createError.message);
      }
    }
  }

  console.log('\n✓ Metadata population complete!');
}

populateMetadata().catch(error => {
  console.error('Error populating metadata:', error);
  process.exit(1);
});
