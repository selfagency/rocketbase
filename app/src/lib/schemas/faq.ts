import { z } from 'zod';

const optionalSlug = z
  .string()
  .trim()
  .max(120, 'Slug must be 120 characters or fewer')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must use lowercase letters, numbers, and hyphens')
  .or(z.literal(''));

const optionalLocale = z
  .string()
  .trim()
  .max(16, 'Locale must be 16 characters or fewer')
  .regex(/^[a-z]{2}(?:-[A-Z]{2})?$/, 'Locale must look like en or en-US')
  .or(z.literal(''));

export const faqCreateSchema = z.object({
  question: z.string().trim().min(3, 'Question must be at least 3 characters').max(240, 'Question is too long'),
  answer: z.string().trim().min(1, 'Answer is required').max(10_000, 'Answer is too long'),
  category: z.string().trim().max(80, 'Category is too long').optional().default(''),
  slug: optionalSlug.optional().default(''),
  locale: optionalLocale.optional().default(''),
  sort_order: z.coerce
    .number('Sort order must be a number')
    .int('Sort order must be a whole number')
    .min(0, 'Sort order must be 0 or greater')
    .max(100_000, 'Sort order is too large'),
  is_published: z.coerce.boolean().default(false),
});

export const faqUpdateSchema = faqCreateSchema.extend({
  id: z.string().trim().min(1, 'Missing FAQ id'),
});
