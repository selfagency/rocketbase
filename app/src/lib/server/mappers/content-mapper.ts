import type { AuditSnapshot } from '$lib/types/revision-history';

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  return value
    .map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && 'id' in item) {
        const id = (item as { id?: string }).id;
        return id || '';
      }

      return '';
    })
    .filter(Boolean);
}

function asNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.floor(value));
}

function normalizeDateInput(dateString: string): string | null {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function mapSnapshotToContentUpdate(snapshot: AuditSnapshot, entity: 'post' | 'page'): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  const title = asString(snapshot.title);
  if (title !== undefined) payload.title = title;

  const slug = asString(snapshot.slug);
  if (slug !== undefined) payload.slug = slug;

  payload.summary = asString(snapshot.summary) ?? '';
  payload.content = asString(snapshot.content) ?? '';

  const published = asBoolean(snapshot.published);
  if (published !== undefined) payload.published = published;

  const visible = asBoolean(snapshot.visible);
  if (visible !== undefined) payload.visible = visible;

  const requireLogin = asBoolean(snapshot.require_login);
  if (requireLogin !== undefined) payload.require_login = requireLogin;

  const subscriberOnly = asBoolean(snapshot.subscriber_only);
  if (subscriberOnly !== undefined) payload.subscriber_only = subscriberOnly;

  const inTrash = asBoolean(snapshot.in_trash);
  if (inTrash !== undefined) payload.in_trash = inTrash;

  payload.attachments = asStringArray(snapshot.attachments) ?? [];

  if (entity === 'post') {
    payload.embed = asString(snapshot.embed) ?? '';
    payload.enclosure = asString(snapshot.enclosure) ?? '';

    const normalizedDate = asString(snapshot.date) ? normalizeDateInput(String(snapshot.date)) : null;
    if (normalizedDate) payload.date = normalizedDate;

    payload.author = asStringArray(snapshot.author) ?? [];
    payload.tags = asStringArray(snapshot.tags) ?? [];
  }

  if (entity === 'page') {
    payload.collection = asString(snapshot.collection) ?? '';
    payload.parent = asString(snapshot.parent) ?? '';
    payload.custom_css = asString(snapshot.custom_css) ?? '';

    const order = asNumber(snapshot.order);
    if (order !== undefined) payload.order = order;
  }

  return payload;
}

export function mapPostSnapshotToUpdate(snapshot: AuditSnapshot): Record<string, unknown> {
  return mapSnapshotToContentUpdate(snapshot, 'post');
}

export function mapPageSnapshotToUpdate(snapshot: AuditSnapshot): Record<string, unknown> {
  return mapSnapshotToContentUpdate(snapshot, 'page');
}
