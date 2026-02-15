import { sanitizeSnapshotValue } from '$lib/utils/snapshot-serializer';

export type AdminFormSnapshot<T> = {
  formData: T;
};

type SnapshotShape = {
  content?: unknown;
  attachments?: unknown;
};

export function captureAdminFormSnapshot<T extends SnapshotShape>(formData: T): AdminFormSnapshot<T> {
  const safeFormData = sanitizeSnapshotValue(formData) as T;

  return {
    formData: {
      ...safeFormData,
      content: typeof safeFormData.content === 'string' ? safeFormData.content : '',
    },
  };
}

export function restoreAdminFormSnapshot<T extends SnapshotShape>(snapshot: unknown): T | null {
  if (!snapshot || typeof snapshot !== 'object') return null;

  const payload = snapshot as Partial<AdminFormSnapshot<T>>;
  if (!payload.formData || typeof payload.formData !== 'object') return null;

  const restored = sanitizeSnapshotValue(payload.formData) as T;

  return {
    ...restored,
    content: typeof restored.content === 'string' ? restored.content : '',
    attachments: Array.isArray(restored.attachments) ? restored.attachments : [],
  } as T;
}

export function getDraftSlug(params: {
  slug?: string | null;
  title?: string | null;
  fallback: string;
  slugify: (value: string) => string;
}): string {
  const explicitSlug = (params.slug ?? '').trim();
  if (explicitSlug) {
    return params.slugify(explicitSlug) || params.fallback;
  }

  const titleSlug = params.slugify((params.title ?? '').trim());
  return titleSlug || params.fallback;
}

export function getDraftFormId(params: {
  isEdit: boolean;
  recordId?: string;
  editPrefix: string;
  existingFormId?: string;
  createId: string;
}): string {
  if (params.isEdit && params.recordId) {
    return `${params.editPrefix}${params.recordId}`;
  }

  if (typeof params.existingFormId === 'string' && params.existingFormId.trim()) {
    return params.existingFormId;
  }

  return params.createId;
}
