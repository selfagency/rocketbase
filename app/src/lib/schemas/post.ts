import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  summary: z.string().max(500).optional(),
  content: z.string().optional(),
  date: z.string().min(1, 'Publish date is required'),
  embed: z.string().optional(),
  enclosure: z.string().optional(),
  published: z.boolean().default(false),
  visible: z.boolean().default(true),
  require_login: z.boolean().default(false),
  subscriber_only: z.boolean().default(false),
  author: z.array(z.string()).min(1, 'At least one author is required'),
  tags: z.array(z.string()).default([]).optional(),
  image: z.instanceof(File).optional(),
  media: z.array(z.instanceof(File)).optional(),
  attachments: z.array(z.string()).default([]),
});

export type PostSchema = typeof postSchema;
