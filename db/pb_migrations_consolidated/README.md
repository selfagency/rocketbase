# Consolidated migration drafts

These files are generated drafts for migration consolidation work and are **not** active yet.

- Source of truth for generation: `db/pb_data/data.db`
- Generator: `db/util/generate_consolidated_migrations.py`
- Dependency/order report: `consolidation-report.json`

## Why this folder exists

The goal is to converge from many incremental schema migrations to one schema migration per collection while preserving:

- stable collection IDs
- relation integrity and ordering
- current rules/indexes/field definitions

## Safety notes

- Generation strips auth token secrets from the `users` auth options.
- Generation applies the repository thumb presets to media/page/post file fields.
- Existing `db/pb_migrations/*` files are unchanged in this step.

## Regenerate

Run from repository root:

`python db/util/generate_consolidated_migrations.py`

## Next consolidation phase

1. Compare each draft file with existing migration chain behavior.
2. Decide the final keep/remove matrix in `db/pb_migrations`.
3. Move validated drafts into active `db/pb_migrations` and remove superseded files.
4. Preserve data migrations (`populate_default_metadata`, snapshots dedupe/index) as separate steps.
