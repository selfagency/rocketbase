/// <reference path="../.types/pocketbase.d.ts" />
migrate(
  app => {
    const collection = new Collection({
      id: 'ronp4q37zviiby1',
      name: 'queue_stats',
      type: 'view',
      system: false,
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      viewQuery: `SELECT
  queue as id,
  SUM(CASE WHEN failed IS '' THEN 1 ELSE 0 END) as pending_tasks,
  SUM(CASE WHEN failed IS NOT '' THEN 1 ELSE 0 END) as failed_tasks
FROM queue_tasks
GROUP BY queue;`,
      options: {},
    });

    return app.save(collection);
  },
  app => {
    const collection = app.findCollectionByNameOrId('ronp4q37zviiby1');
    return app.delete(collection);
  }
);
