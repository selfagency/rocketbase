import { describe, it, expect, vi } from 'vitest';
import { generatePostMetaTags } from '../../../lib/utils/seo-metadata';

// Mock the getFileUrl function
vi.mock('$lib/utils', () => ({
	getFileUrl: (collection: string, id: string, filename: string, cdnUrl?: string) => {
		const base = cdnUrl || '';
		return `${base}/api/files/${collection}/${id}/${filename}`;
	},
}));

describe('seo-metadata utilities', () => {
	describe('generatePostMetaTags', () => {
		const mockPost = {
			id: 'post123',
			slug: 'test-post',
			title: 'Test Post Title',
			summary: 'This is a test post summary',
			content: 'Post content',
			date: '2024-01-01T00:00:00Z',
			updated: '2024-01-02T00:00:00Z',
			image: 'cover.jpg',
			expand: {
				author: [
					{ id: 'author1', name: 'John Doe', email: 'john@example.com' },
					{ id: 'author2', name: '', email: 'jane@example.com' },
				],
				tags: [
					{ id: 'tag1', name: 'Technology' },
					{ id: 'tag2', name: 'Programming' },
				],
			},
		} as any;

		it('generates complete meta tags for a post with all fields', () => {
			const result = generatePostMetaTags({
				post: mockPost,
				origin: 'https://example.com',
			});

			expect(result.title).toBe('Test Post Title');
			expect(result.description).toBe('This is a test post summary');
			expect(result.canonical).toBe('https://example.com/posts/test-post');
		});

		it('generates OpenGraph metadata', () => {
			const result = generatePostMetaTags({
				post: mockPost,
				origin: 'https://example.com',
			});

			expect(result.openGraph).toMatchObject({
				type: 'article',
				url: 'https://example.com/posts/test-post',
				title: 'Test Post Title',
				description: 'This is a test post summary',
			});

			expect(result.openGraph?.images).toHaveLength(1);
			expect(result.openGraph?.images?.[0]).toMatchObject({
				url: 'https://example.com/api/files/posts/post123/cover.jpg',
				width: 1200,
				height: 630,
				alt: 'Test Post Title',
			});
		});

		it('generates article-specific OpenGraph metadata', () => {
			const result = generatePostMetaTags({
				post: mockPost,
				origin: 'https://example.com',
			});

			expect(result.openGraph?.article).toMatchObject({
				publishedTime: '2024-01-01T00:00:00Z',
				modifiedTime: '2024-01-02T00:00:00Z',
				authors: ['John Doe', 'jane@example.com'],
				tags: ['Technology', 'Programming'],
			});
		});

		it('generates JSON-LD structured data', () => {
			const result = generatePostMetaTags({
				post: mockPost,
				origin: 'https://example.com',
			});

			expect(result.jsonLd).toMatchObject({
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				headline: 'Test Post Title',
				description: 'This is a test post summary',
				datePublished: '2024-01-01T00:00:00Z',
				dateModified: '2024-01-02T00:00:00Z',
			});
		});

		it('includes author information in JSON-LD', () => {
			const result = generatePostMetaTags({
				post: mockPost,
				origin: 'https://example.com',
			});

			expect(result.jsonLd.author).toHaveLength(2);
			expect(result.jsonLd.author[0]).toMatchObject({
				'@type': 'Person',
				name: 'John Doe',
				url: 'https://example.com/authors/author1',
			});
			expect(result.jsonLd.author[1]).toMatchObject({
				'@type': 'Person',
				name: 'jane@example.com',
				url: 'https://example.com/authors/author2',
			});
		});

		it('includes publisher information in JSON-LD', () => {
			const result = generatePostMetaTags({
				post: mockPost,
				origin: 'https://example.com',
				siteName: 'My Blog',
				ogImage: 'https://example.com/logo.png',
			});

			expect(result.jsonLd.publisher).toMatchObject({
				'@type': 'Organization',
				name: 'My Blog',
				logo: {
					'@type': 'ImageObject',
					url: 'https://example.com/logo.png',
				},
			});
		});

		it('uses default site name when not provided', () => {
			const result = generatePostMetaTags({
				post: mockPost,
				origin: 'https://example.com',
			});

			expect(result.jsonLd.publisher.name).toBe('Rocketbase');
		});

		it('handles posts without images', () => {
			const postWithoutImage = { ...mockPost, image: null };

			const result = generatePostMetaTags({
				post: postWithoutImage as any,
				origin: 'https://example.com',
			});

			expect(result.openGraph?.images).toEqual([]);
			expect(result.jsonLd.image).toBeUndefined();
		});

		it('handles posts without authors', () => {
			const postWithoutAuthors = {
				...mockPost,
				expand: { ...mockPost.expand, author: [] },
			};

			const result = generatePostMetaTags({
				post: postWithoutAuthors as any,
				origin: 'https://example.com',
			});

			expect(result.openGraph?.article?.authors).toEqual([]);
			expect(result.jsonLd.author).toEqual([]);
		});

		it('handles posts without tags', () => {
			const postWithoutTags = {
				...mockPost,
				expand: { ...mockPost.expand, tags: [] },
			};

			const result = generatePostMetaTags({
				post: postWithoutTags as any,
				origin: 'https://example.com',
			});

			expect(result.openGraph?.article?.tags).toEqual([]);
		});

		it('handles posts without expand data', () => {
			const postWithoutExpand = {
				...mockPost,
				expand: undefined,
			};

			const result = generatePostMetaTags({
				post: postWithoutExpand as any,
				origin: 'https://example.com',
			});

			expect(result.openGraph?.article?.authors).toEqual([]);
			expect(result.openGraph?.article?.tags).toEqual([]);
		});

		it('uses CDN URL when provided', () => {
			const result = generatePostMetaTags({
				post: mockPost,
				origin: 'https://example.com',
				cdnUrl: 'https://cdn.example.com',
			});

			// Image URL should include the CDN path
			expect(result.openGraph?.images?.[0].url).toContain('/api/files/posts/post123/cover.jpg');
		});

		it('generates correct canonical URL for different slugs', () => {
			const differentPost = { ...mockPost, slug: 'another-slug' };

			const result = generatePostMetaTags({
				post: differentPost as any,
				origin: 'https://example.com',
			});

			expect(result.canonical).toBe('https://example.com/posts/another-slug');
		});

		it('handles different origins', () => {
			const result = generatePostMetaTags({
				post: mockPost,
				origin: 'https://blog.mysite.com',
			});

			expect(result.canonical).toBe('https://blog.mysite.com/posts/test-post');
			expect(result.openGraph?.url).toBe('https://blog.mysite.com/posts/test-post');
		});

		it('publisher logo is undefined when ogImage not provided', () => {
			const result = generatePostMetaTags({
				post: mockPost,
				origin: 'https://example.com',
			});

			expect(result.jsonLd.publisher.logo).toBeUndefined();
		});
	});
});
