import { describe, expect, it, vi } from 'vitest';

import { actions, load } from '../../../../../routes/admin/faqs/+page.server';

describe('admin faqs +page.server', () => {
  it('redirects to login when unauthenticated', async () => {
    const locals = {
      user: null,
      pb: {
        collection: vi.fn(),
      },
    } as any;

    await expect(load({ locals } as any)).rejects.toMatchObject({
      status: 303,
      location: '/login',
    });
  });

  it('returns 403 for non-admin users', async () => {
    const locals = {
      user: { id: 'u1', role: 'editor' },
      pb: {
        collection: vi.fn(),
      },
    } as any;

    await expect(load({ locals } as any)).rejects.toMatchObject({
      status: 403,
    });
  });

  it('returns validation failure for invalid create input', async () => {
    const create = vi.fn();
    const locals = {
      user: { id: 'admin-1', role: 'admin' },
      pb: {
        collection: vi.fn(() => ({ create })),
      },
    } as any;

    const formData = new FormData();
    formData.set('question', 'Q');
    formData.set('answer', '');
    formData.set('sort_order', '-1');

    const request = new Request('http://localhost/admin/faqs', {
      method: 'POST',
      body: formData,
    });

    const result = await actions.create({ locals, request } as any);

    expect(result.status).toBe(400);
    expect(result.data.action).toBe('create');
    expect(create).not.toHaveBeenCalled();
  });

  it('creates FAQ and redirects on success', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'faq-1' });
    const locals = {
      user: { id: 'admin-1', role: 'admin' },
      pb: {
        collection: vi.fn(() => ({ create })),
      },
    } as any;

    const formData = new FormData();
    formData.set('question', 'How do I contact support?');
    formData.set('answer', 'Email support@example.com.');
    formData.set('category', 'support');
    formData.set('slug', 'contact-support');
    formData.set('locale', 'en');
    formData.set('sort_order', '1');
    formData.set('is_published', 'on');

    const request = new Request('http://localhost/admin/faqs', {
      method: 'POST',
      body: formData,
    });

    await expect(actions.create({ locals, request } as any)).rejects.toMatchObject({
      status: 303,
      location: '/admin/faqs?faq=created',
    });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('toggles publish status with admin authorization', async () => {
    const update = vi.fn().mockResolvedValue({});
    const locals = {
      user: { id: 'admin-1', role: 'admin' },
      pb: {
        collection: vi.fn(() => ({ update })),
      },
    } as any;

    const formData = new FormData();
    formData.set('id', 'faq-1');
    formData.set('current', 'false');

    const request = new Request('http://localhost/admin/faqs', {
      method: 'POST',
      body: formData,
    });

    await expect(actions.togglePublished({ locals, request } as any)).rejects.toMatchObject({
      status: 303,
      location: '/admin/faqs?faq=published',
    });

    expect(update).toHaveBeenCalledWith('faq-1', {
      is_published: true,
    });
  });
});
