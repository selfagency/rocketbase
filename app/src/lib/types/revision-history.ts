export type AuditSnapshot = Record<string, unknown>;

export type RevisionEventType = 'create' | 'update';

export type RevisionHistoryEntry = {
  id: string;
  eventType: RevisionEventType;
  timestamp: string;
  created: string;
  authorId: string | null;
  authorName: string;
  authorEmail: string | null;
  before: AuditSnapshot | null;
  after: AuditSnapshot | null;
};
