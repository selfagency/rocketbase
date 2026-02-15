import { z } from 'zod';

export const portfolioSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  summary: z.string().max(500).optional(),
  description: z.string().optional(),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  published: z.boolean().default(false),
  visible: z.boolean().default(true),
  image: z.instanceof(File).optional(),
  media: z.array(z.instanceof(File)).optional(),
  existingMedia: z.array(z.string()).default([]),
});

export type PortfolioSchema = typeof portfolioSchema;
