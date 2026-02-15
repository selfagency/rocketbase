import { describe, expect, it } from 'vitest';
import { postSchema } from '../../../lib/schemas/post';

const validPost = {
  title: 'Post title',
  slug: 'post-title',
  date: '2026-02-15T08:00',
  author: ['author-1'],
  attachments: [],
};

describe('postSchema', () => {
  it('accepts valid post payload', () => {
    const result = postSchema.safeParse(validPost);
    expect(result.success).toBe(true);
  });

  it('rejects missing title', () => {
    expect(postSchema.safeParse({ ...validPost, title: '' }).success).toBe(false);
  });

  it('rejects missing slug', () => {
    expect(postSchema.safeParse({ ...validPost, slug: '' }).success).toBe(false);
  });

  it('rejects missing date', () => {
    expect(postSchema.safeParse({ ...validPost, date: '' }).success).toBe(false);
  });

  it('rejects empty authors array', () => {
    expect(postSchema.safeParse({ ...validPost, author: [] }).success).toBe(false);
  });

  it('applies expected default values', () => {
    const parsed = postSchema.parse({
      title: 'Defaults',
      slug: 'defaults',
      date: '2026-02-15T08:00',
      author: ['author-1'],
    });

    expect(parsed.published).toBe(false);
    expect(parsed.visible).toBe(true);
    expect(parsed.require_login).toBe(false);
    expect(parsed.subscriber_only).toBe(false);
    expect(parsed.attachments).toEqual([]);
    expect(parsed.tags).toEqual([]);
  });
});
