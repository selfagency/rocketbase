import type { TypedPocketBase } from '$lib/types/pocketbase';
import type { AuditSnapshot, RevisionEventType, RevisionHistoryEntry } from '$lib/types/revision-history';

const SUPPORTED_EVENT_TYPES: RevisionEventType[] = ['create', 'update'];

type SupportedCollection = 'pages' | 'posts';

function escapeFilterValue(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

function asSnapshot(value: unknown): AuditSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as AuditSnapshot;
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function parseAuthor(user: unknown): { authorId: string | null; authorName: string; authorEmail: string | null } {
  if (user && typeof user === 'object' && !Array.isArray(user)) {
    const objectUser = user as Record<string, unknown>;
    const id = toStringOrNull(objectUser.id);
    const email = toStringOrNull(objectUser.email);
    const name = toStringOrNull(objectUser.name);

    return {
      authorId: id,
      authorName: name || email || 'Unknown user',
      authorEmail: email,
    };
  }

  const id = toStringOrNull(user);
  return {
    authorId: id,
    authorName: id ? 'Unknown user' : 'System',
    authorEmail: null,
  };
}

export function getRestoreSnapshot(entry: RevisionHistoryEntry): AuditSnapshot | null {
  if (entry.eventType === 'create') {
    return entry.after;
  }

  if (entry.eventType === 'update') {
    return entry.after;
  }

  return null;
}

export async function getRevisionHistory(
  pb: TypedPocketBase,
  collectionName: SupportedCollection,
  recordId: string,
  limit = 30
): Promise<RevisionHistoryEntry[]> {
  const escapedCollectionName = escapeFilterValue(collectionName);
  const escapedRecordId = escapeFilterValue(recordId);
  const filter = `collection_name = "${escapedCollectionName}" && record_id = "${escapedRecordId}" && (event_type = "create" || event_type = "update")`;

  const result = await pb.collection('audit_logs').getList(1, limit, {
    filter,
    sort: '-timestamp,-created',
    expand: 'user',
    fields:
      'id,event_type,timestamp,created,user,before_changes,after_changes,expand.user.id,expand.user.name,expand.user.email',
  });

  return result.items
    .map(item => {
      const record = item as Record<string, unknown>;
      const rawEventType = toStringOrNull(record.event_type);
      if (!rawEventType || !SUPPORTED_EVENT_TYPES.includes(rawEventType as RevisionEventType)) {
        return null;
      }

      const timestamp = toStringOrNull(record.timestamp) || toStringOrNull(record.created) || new Date().toISOString();
      const created = toStringOrNull(record.created) || timestamp;

      const expandedUser =
        record.expand && typeof record.expand === 'object' && !Array.isArray(record.expand)
          ? (record.expand as Record<string, unknown>).user
          : null;

      const { authorId, authorName, authorEmail } = parseAuthor(expandedUser ?? record.user);

      return {
        id: String(record.id || ''),
        eventType: rawEventType as RevisionEventType,
        timestamp,
        created,
        authorId,
        authorName,
        authorEmail,
        before: asSnapshot(record.before_changes),
        after: asSnapshot(record.after_changes),
      } satisfies RevisionHistoryEntry;
    })
    .filter((entry): entry is RevisionHistoryEntry => Boolean(entry?.id));
}
