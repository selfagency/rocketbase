#!/usr/bin/env python3
"""Generate consolidated PocketBase schema migrations (one per collection).

This script reads the current schema from db/pb_data/data.db and writes
ordered migration files into db/pb_migrations_consolidated/.

It is intentionally non-destructive: existing db/pb_migrations files are not
modified. The generated output is meant for review before replacing legacy
migration chains.
"""

from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
DB_PATH = REPO_ROOT / "db" / "pb_data" / "data.db"
OUT_DIR = REPO_ROOT / "db" / "pb_migrations_consolidated"

TARGET_COLLECTIONS = [
    "users",
    "media",
    "tags",
    "metadata",
    "redirects",
    "pages",
    "posts",
    "comments",
    "portfolio",
    "snapshots",
    "audit_logs",
    "queue_tasks",
    "queue_locks",
    "queue_stats",
]

THUMB_PRESETS = [
    "100x100",
    "480x0",
    "768x0",
    "1200x0",
    "1600x0",
    "1200x630f",
    "1200x675f",
    "1200x627f",
    "1080x1080f",
]

TOKEN_OPTION_KEYS = {
    "authToken",
    "passwordResetToken",
    "emailChangeToken",
    "verificationToken",
    "fileToken",
}


@dataclass
class Collection:
    id: str
    name: str
    type: str
    system: bool
    fields: list[dict[str, Any]]
    indexes: list[str]
    listRule: str | None
    viewRule: str | None
    createRule: str | None
    updateRule: str | None
    deleteRule: str | None
    options: dict[str, Any]


def load_collections() -> dict[str, Collection]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    placeholders = ",".join("?" for _ in TARGET_COLLECTIONS)
    rows = conn.execute(
        f"""
        SELECT id, name, type, system, fields, indexes,
               listRule, viewRule, createRule, updateRule, deleteRule, options
        FROM _collections
        WHERE name IN ({placeholders})
        """,
        TARGET_COLLECTIONS,
    ).fetchall()
    conn.close()

    found = {row["name"] for row in rows}
    missing = sorted(set(TARGET_COLLECTIONS) - found)
    if missing:
        raise RuntimeError(f"Missing target collections in DB: {', '.join(missing)}")

    collections: dict[str, Collection] = {}
    for row in rows:
        fields = json.loads(row["fields"])
        indexes = json.loads(row["indexes"])
        options = json.loads(row["options"])

        # keep migration output deterministic
        if row["name"] in {"media", "pages", "posts"}:
            for field in fields:
                if field.get("type") == "file" and field.get("id") in {
                    "file2359244304",  # media.file
                    "file3309110367",  # pages.image / posts.image
                }:
                    field["thumbs"] = THUMB_PRESETS

        # never serialize environment-specific token secrets
        if row["name"] == "users":
            for token_key in TOKEN_OPTION_KEYS:
                token_opts = options.get(token_key)
                if isinstance(token_opts, dict):
                    token_opts.pop("secret", None)

        collections[row["name"]] = Collection(
            id=row["id"],
            name=row["name"],
            type=row["type"],
            system=bool(row["system"]),
            fields=fields,
            indexes=indexes,
            listRule=row["listRule"],
            viewRule=row["viewRule"],
            createRule=row["createRule"],
            updateRule=row["updateRule"],
            deleteRule=row["deleteRule"],
            options=options,
        )

    return collections


def build_deps(collections: dict[str, Collection]) -> dict[str, set[str]]:
    id_to_name = {c.id: c.name for c in collections.values()}
    deps: dict[str, set[str]] = {name: set() for name in collections}

    for name, collection in collections.items():
        for field in collection.fields:
            if field.get("type") != "relation":
                continue
            relation_id = field.get("collectionId")
            dep_name = id_to_name.get(relation_id)
            if dep_name and dep_name != name:
                deps[name].add(dep_name)

    # View depends on queue_tasks query
    if "queue_stats" in deps:
        deps["queue_stats"].add("queue_tasks")

    return deps


def topo_sort(deps: dict[str, set[str]]) -> list[str]:
    remaining = {k: set(v) for k, v in deps.items()}
    ordered: list[str] = []

    while remaining:
        ready = sorted([name for name, reqs in remaining.items() if not reqs])
        if not ready:
            cycle_desc = ", ".join(f"{k}->{sorted(v)}" for k, v in remaining.items())
            raise RuntimeError(f"Dependency cycle detected: {cycle_desc}")

        for name in ready:
            ordered.append(name)
            remaining.pop(name)

        for reqs in remaining.values():
            reqs.difference_update(ready)

    return ordered


def to_js(value: Any, indent: int = 2) -> str:
    return json.dumps(value, ensure_ascii=False, indent=indent)


def render_collection_migration(ts: int, collection: Collection) -> str:
    payload: dict[str, Any] = {
        "id": collection.id,
        "name": collection.name,
        "type": collection.type,
        "system": collection.system,
        "listRule": collection.listRule,
        "viewRule": collection.viewRule,
        "createRule": collection.createRule,
        "updateRule": collection.updateRule,
        "deleteRule": collection.deleteRule,
        "fields": collection.fields,
        "indexes": collection.indexes,
    }

    if collection.type == "view":
        payload["viewQuery"] = collection.options.get("viewQuery", "")

    if collection.type == "auth":
        # PocketBase auth config keys are top-level in migration snapshots
        payload.update(collection.options)

    js_payload = to_js(payload, indent=2)
    update_payload = {k: v for k, v in payload.items() if k != "id"}
    js_update_payload = to_js(update_payload, indent=2)

    self_relation_fields = [
        field
        for field in collection.fields
        if field.get("type") == "relation" and field.get("collectionId") == collection.id
    ]
    has_self_relations = len(self_relation_fields) > 0

    create_payload = dict(payload)
    if has_self_relations:
        create_payload["fields"] = [
            field
            for field in collection.fields
            if not (field.get("type") == "relation" and field.get("collectionId") == collection.id)
        ]

    js_create_payload = to_js(create_payload, indent=2)

    return f'''/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {{
    const collectionData = {js_payload};
    const collectionCreateData = {js_create_payload};
    const collectionUpdateData = {js_update_payload};

    let collection = null;
    try {{
        collection = app.findCollectionByNameOrId("{collection.id}");
    }} catch (_) {{
        collection = null;
    }}

    if (!collection) {{
        try {{
            collection = app.findCollectionByNameOrId("{collection.name}");
        }} catch (_) {{
            collection = null;
        }}
    }}

    if (collection) {{
        unmarshal(collectionUpdateData, collection);
        return app.save(collection);
    }}

    collection = new Collection(collectionCreateData);
    const createResult = app.save(collection);

    if ({str(has_self_relations).lower()}) {{
        unmarshal(collectionUpdateData, collection);
        return app.save(collection);
    }}

    return createResult;
}}, (app) => {{
    try {{
        const collection = app.findCollectionByNameOrId("{collection.id}");
        return app.delete(collection);
    }} catch (_) {{
        try {{
            const collection = app.findCollectionByNameOrId("{collection.name}");
            return app.delete(collection);
        }} catch (_) {{
            return null;
        }}
    }}
}})
'''


def main() -> None:
    collections = load_collections()
    deps = build_deps(collections)
    order = topo_sort(deps)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = 1770001000
    report: list[dict[str, Any]] = []

    for name in order:
        collection = collections[name]
        file_name = f"{timestamp}_consolidated_{name}.js"
        file_path = OUT_DIR / file_name
        file_path.write_text(render_collection_migration(timestamp, collection), encoding="utf-8")

        report.append(
            {
                "timestamp": timestamp,
                "name": name,
                "id": collection.id,
                "type": collection.type,
                "depends_on": sorted(deps[name]),
                "file": str(file_path.relative_to(REPO_ROOT)),
            }
        )
        timestamp += 10

    report_path = OUT_DIR / "consolidation-report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Wrote {len(report)} consolidated migration files to {OUT_DIR}")
    print(f"Report: {report_path}")


if __name__ == "__main__":
    main()
