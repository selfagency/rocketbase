import { z } from 'zod';

export const pageSchema = z.object({
	title: z.string().min(1, 'Title is required').max(200),
	slug: z
		.string()
		.min(1, 'Slug is required')
		.max(200)
		.regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
	summary: z.string().max(500).optional(),
	content: z.string().optional(),
	collection: z.enum(['posts', 'tags']).optional(),
	published: z.boolean().default(false),
	visible: z.boolean().default(true),
	order: z.number().int().min(0).optional(),
	image: z.instanceof(File).optional(),
	media: z.array(z.instanceof(File)).optional(),
	parent: z.string().optional(),
	require_login: z.boolean().default(false),
	subscriber_only: z.boolean().default(false),
	custom_css: z.string().optional()
});

export type PageSchema = typeof pageSchema;
