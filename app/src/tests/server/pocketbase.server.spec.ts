import { createPocketBaseClient } from '$lib/server/pocketbase';
import { describe, expect, it } from 'vitest';

describe('createPocketBaseClient afterSend flattening', () => {
  it('preserves array responses returned by getFullList and flattens expand fields', () => {
    const pb = createPocketBaseClient();
    expect(pb.afterSend).toBeTypeOf('function');

    const response = [
      {
        id: '1',
        title: 'One',
        expand: {
          media: [{ id: 'm1' }],
        },
      },
    ];

    const transformed = pb.afterSend?.(new Response(), response);

    expect(Array.isArray(transformed)).toBe(true);
    expect(transformed).toEqual([
      {
        id: '1',
        title: 'One',
        media: [{ id: 'm1' }],
      },
    ]);
  });

  it('flattens paginated list items and keeps list envelope', () => {
    const pb = createPocketBaseClient();

    const response = {
      page: 1,
      perPage: 30,
      totalItems: 1,
      items: [
        {
          id: '1',
          title: 'One',
          expand: {
            author: { id: 'u1' },
          },
        },
      ],
    };

    const transformed = pb.afterSend?.(new Response(), response) as typeof response;

    expect(transformed.items).toEqual([
      {
        id: '1',
        title: 'One',
        author: { id: 'u1' },
      },
    ]);
    expect(transformed.page).toBe(1);
  });
});
