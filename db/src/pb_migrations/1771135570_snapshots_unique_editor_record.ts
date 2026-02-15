/// <reference path="../../pb_data/types.d.ts" />

migrate(
  app => {
    app
      .db()
      .newQuery(
        `
        DELETE FROM snapshots
        WHERE id IN (
          SELECT s1.id
          FROM snapshots s1
          JOIN snapshots s2
            ON s1.collection_id = s2.collection_id
           AND s1.record_id = s2.record_id
           AND s1.editor = s2.editor
           AND (
             s1.updated < s2.updated
             OR (s1.updated = s2.updated AND s1.id < s2.id)
           )
        )
        `
      )
      .execute();

    app
      .db()
      .newQuery(
        'CREATE UNIQUE INDEX IF NOT EXISTS idx_snapshots_editor_record ON snapshots (collection_id, record_id, editor)'
      )
      .execute();
  },
  app => {
    app.db().newQuery('DROP INDEX IF EXISTS idx_snapshots_editor_record').execute();
  }
);
