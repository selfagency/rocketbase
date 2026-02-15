import { describe, expect, it } from 'vitest';
import { pageSchema } from '../../../lib/schemas/page';

const validPage = {
  title: 'Welcome',
  slug: 'welcome',
  summary: 'Summary',
  content: '<p>Hello</p>',
  attachments: [],
};

describe('pageSchema', () => {
  it('accepts valid page payload', () => {
    const result = pageSchema.safeParse(validPage);
    expect(result.success).toBe(true);
  });

  it('rejects missing title', () => {
    const result = pageSchema.safeParse({ ...validPage, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid slug formats', () => {
    expect(pageSchema.safeParse({ ...validPage, slug: 'Bad Slug' }).success).toBe(false);
    expect(pageSchema.safeParse({ ...validPage, slug: 'UPPER' }).success).toBe(false);
    expect(pageSchema.safeParse({ ...validPage, slug: 'bad_slug' }).success).toBe(false);
  });

  it('allows only lowercase letters numbers and hyphens in slug', () => {
    expect(pageSchema.safeParse({ ...validPage, slug: 'abc-123-z' }).success).toBe(true);
  });

  it('applies expected default values', () => {
    const parsed = pageSchema.parse({
      title: 'Defaults',
      slug: 'defaults',
    });

    expect(parsed.published).toBe(false);
    expect(parsed.visible).toBe(true);
    expect(parsed.require_login).toBe(false);
    expect(parsed.subscriber_only).toBe(false);
    expect(parsed.attachments).toEqual([]);
  });
});
