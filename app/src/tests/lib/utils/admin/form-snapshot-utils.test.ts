import { describe, expect, it } from 'vitest';

import {
  captureAdminFormSnapshot,
  getDraftFormId,
  getDraftSlug,
  restoreAdminFormSnapshot,
} from '../../../../lib/utils/admin/form-snapshot-utils';

describe('form-snapshot-utils', () => {
  it('captures sanitized snapshot with normalized content', () => {
    const file = new File(['x'], 'x.txt', { type: 'text/plain' });

    const snapshot = captureAdminFormSnapshot({
      title: 'Hello',
      content: undefined,
      attachments: ['a'],
      file,
    });

    expect(snapshot.formData.content).toBe('');
    expect(snapshot.formData.attachments).toEqual(['a']);
    expect((snapshot.formData as any).file).toBeUndefined();
  });

  it('restores valid snapshot payload and normalizes fields', () => {
    const restored = restoreAdminFormSnapshot<{ title: string; content: string; attachments: string[] }>({
      formData: {
        title: 'Title',
        content: 'Body',
        attachments: ['m1'],
      },
    });

    expect(restored).toEqual({
      title: 'Title',
      content: 'Body',
      attachments: ['m1'],
    });
  });

  it('returns null for invalid snapshot payload', () => {
    expect(restoreAdminFormSnapshot(null)).toBeNull();
    expect(restoreAdminFormSnapshot({})).toBeNull();
    expect(restoreAdminFormSnapshot({ formData: 'x' })).toBeNull();
  });

  it('builds draft slug from explicit slug then title then fallback', () => {
    const slugify = (value: string) => value.toLowerCase().replaceAll(' ', '-');

    expect(getDraftSlug({ slug: 'My Slug', title: 'Ignored', fallback: 'untitled', slugify })).toBe('my-slug');
    expect(getDraftSlug({ slug: '', title: 'My Title', fallback: 'untitled', slugify })).toBe('my-title');
    expect(getDraftSlug({ slug: '', title: '', fallback: 'untitled', slugify })).toBe('untitled');
  });

  it('builds draft form id for edit/create flows', () => {
    expect(
      getDraftFormId({
        isEdit: true,
        recordId: 'abc',
        editPrefix: 'admin-post-edit-',
        existingFormId: 'ignored',
        createId: 'admin-post-create',
      })
    ).toBe('admin-post-edit-abc');

    expect(
      getDraftFormId({
        isEdit: false,
        editPrefix: 'admin-post-edit-',
        existingFormId: 'custom-id',
        createId: 'admin-post-create',
      })
    ).toBe('custom-id');

    expect(
      getDraftFormId({
        isEdit: false,
        editPrefix: 'admin-post-edit-',
        existingFormId: '',
        createId: 'admin-post-create',
      })
    ).toBe('admin-post-create');
  });
});
