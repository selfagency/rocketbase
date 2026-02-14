/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('_pb_users_auth_');

		// Allow public to view users (for blog post authors)
		// This enables the expand feature to work for anonymous visitors
		collection.listRule = '';
		collection.viewRule = '';

		return app.save(collection);
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('_pb_users_auth_');

		// Rollback to previous restrictive permissions
		collection.listRule = 'id = @request.auth.id';
		collection.viewRule = 'id = @request.auth.id';

		return app.save(collection);
	}
);
