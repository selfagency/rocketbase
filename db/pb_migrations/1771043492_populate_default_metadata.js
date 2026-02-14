/// <reference path="../pb_data/types.d.ts" />
migrate(
	() => {
		// Default site metadata for SEO
		const defaultMetadata = [
			{
				key: 'site_title',
				value: 'Rocketbase',
				type: 'string'
			},
			{
				key: 'site_description',
				value: 'A production-ready full-stack application built with PocketBase and SvelteKit',
				type: 'string'
			},
			{
				key: 'og_image',
				value: '',
				type: 'string'
			},
			{
				key: 'twitter_site',
				value: '',
				type: 'string'
			},
			{
				key: 'twitter_handle',
				value: '',
				type: 'string'
			},
			{
				key: 'cdn_url',
				value: '',
				type: 'string'
			}
		];

		// Insert each metadata entry
		for (const meta of defaultMetadata) {
			// Check if metadata already exists
			const existing = $dbx
				.newQuery('SELECT * FROM metadata WHERE key = {:key}')
				.bind({ key: meta.key })
				.one();

			if (!existing) {
				// Not found, create new record
				$dbx.newQuery('INSERT INTO metadata (key, value, type) VALUES ({:key}, {:value}, {:type})').bind({
					key: meta.key,
					value: meta.value,
					type: meta.type
				}).execute();
			}
		}
	},
	() => {
		// Delete the default metadata entries on rollback
		const keys = [
			'site_title',
			'site_description',
			'og_image',
			'twitter_site',
			'twitter_handle',
			'cdn_url'
		];

		for (const key of keys) {
			$dbx.newQuery('DELETE FROM metadata WHERE key = {:key}').bind({ key: key }).execute();
		}
	}
);
