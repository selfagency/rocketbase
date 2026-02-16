import { describe, expect, it } from 'vitest';
import { faqCreateSchema, faqUpdateSchema } from '../../../lib/schemas/faq';

describe('faq schemas', () => {
  it('validates a valid create payload', () => {
    const result = faqCreateSchema.safeParse({
      question: 'How do I reset my password?',
      answer: 'Use the forgot password link on the login page.',
      category: 'account',
      slug: 'reset-password',
      locale: 'en',
      sort_order: 1,
      is_published: true,
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid slug format', () => {
    const result = faqCreateSchema.safeParse({
      question: 'Q',
      answer: 'A',
      slug: 'Invalid Slug',
      locale: 'en',
      sort_order: 0,
      is_published: false,
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid locale format', () => {
    const result = faqCreateSchema.safeParse({
      question: 'How are locales validated?',
      answer: 'Only en or en-US style values are accepted.',
      locale: 'english',
      sort_order: 0,
      is_published: false,
    });

    expect(result.success).toBe(false);
  });

  it('rejects negative sort order', () => {
    const result = faqCreateSchema.safeParse({
      question: 'Can sort order be negative?',
      answer: 'No.',
      sort_order: -1,
      is_published: false,
    });

    expect(result.success).toBe(false);
  });

  it('requires id for updates', () => {
    const result = faqUpdateSchema.safeParse({
      question: 'How do updates work?',
      answer: 'An id is required for updates.',
      sort_order: 0,
      is_published: false,
    });

    expect(result.success).toBe(false);
  });
});
