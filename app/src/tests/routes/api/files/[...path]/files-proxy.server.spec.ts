import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../../../../routes/api/files/[...path]/+server';

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('API Files Proxy', () => {
	let mockParams: any;
	let mockRequest: any;

	beforeEach(() => {
		vi.clearAllMocks();

		mockParams = {
			path: 'posts/post123/image.jpg',
		};

		mockRequest = {
			headers: {
				get: vi.fn((header: string) => {
					if (header === 'User-Agent') return 'Mozilla/5.0';
					if (header === 'Accept') return 'image/*';
					return null;
				}),
			},
		};
	});

	describe('GET handler', () => {
		it('proxies file request to PocketBase', async () => {
			const mockBody = new ReadableStream();
			mockFetch.mockResolvedValue({
				status: 200,
				body: mockBody,
				headers: {
					get: vi.fn((header: string) => {
						if (header === 'Content-Type') return 'image/jpeg';
						if (header === 'Cache-Control') return 'public, max-age=31536000';
						if (header === 'Content-Length') return '12345';
						return null;
					}),
				},
			});

			const response = await GET({ params: mockParams, request: mockRequest } as any);

			expect(mockFetch).toHaveBeenCalledWith('http://127.0.0.1:8090/api/files/posts/post123/image.jpg', {
				method: 'GET',
				headers: {
					'User-Agent': 'Mozilla/5.0',
					Accept: 'image/*',
				},
			});

			expect(response.status).toBe(200);
		});

		it('forwards User-Agent header to PocketBase', async () => {
			mockFetch.mockResolvedValue({
				status: 200,
				body: new ReadableStream(),
				headers: { get: vi.fn(() => null) },
			});

			await GET({ params: mockParams, request: mockRequest } as any);

			const fetchCall = mockFetch.mock.calls[0];
			expect(fetchCall[1].headers['User-Agent']).toBe('Mozilla/5.0');
		});

		it('forwards Accept header to PocketBase', async () => {
			mockFetch.mockResolvedValue({
				status: 200,
				body: new ReadableStream(),
				headers: { get: vi.fn(() => null) },
			});

			await GET({ params: mockParams, request: mockRequest } as any);

			const fetchCall = mockFetch.mock.calls[0];
			expect(fetchCall[1].headers.Accept).toBe('image/*');
		});

		it('uses default User-Agent if not provided', async () => {
			mockRequest.headers.get = vi.fn((header: string) => {
				if (header === 'Accept') return 'image/*';
				return null;
			});

			mockFetch.mockResolvedValue({
				status: 200,
				body: new ReadableStream(),
				headers: { get: vi.fn(() => null) },
			});

			await GET({ params: mockParams, request: mockRequest } as any);

			const fetchCall = mockFetch.mock.calls[0];
			expect(fetchCall[1].headers['User-Agent']).toBe('');
		});

		it('uses default Accept header if not provided', async () => {
			mockRequest.headers.get = vi.fn((header: string) => {
				if (header === 'User-Agent') return 'Mozilla/5.0';
				return null;
			});

			mockFetch.mockResolvedValue({
				status: 200,
				body: new ReadableStream(),
				headers: { get: vi.fn(() => null) },
			});

			await GET({ params: mockParams, request: mockRequest } as any);

			const fetchCall = mockFetch.mock.calls[0];
			expect(fetchCall[1].headers.Accept).toBe('*/*');
		});

		it('returns correct Content-Type header from PocketBase', async () => {
			mockFetch.mockResolvedValue({
				status: 200,
				body: new ReadableStream(),
				headers: {
					get: vi.fn((header: string) => {
						if (header === 'Content-Type') return 'image/png';
						return null;
					}),
				},
			});

			const response = await GET({ params: mockParams, request: mockRequest } as any);

			expect(response.headers.get('Content-Type')).toBe('image/png');
		});

		it('uses default Content-Type if not provided by PocketBase', async () => {
			mockFetch.mockResolvedValue({
				status: 200,
				body: new ReadableStream(),
				headers: { get: vi.fn(() => null) },
			});

			const response = await GET({ params: mockParams, request: mockRequest } as any);

			expect(response.headers.get('Content-Type')).toBe('application/octet-stream');
		});

		it('returns Cache-Control header from PocketBase', async () => {
			mockFetch.mockResolvedValue({
				status: 200,
				body: new ReadableStream(),
				headers: {
					get: vi.fn((header: string) => {
						if (header === 'Cache-Control') return 'public, max-age=3600';
						return null;
					}),
				},
			});

			const response = await GET({ params: mockParams, request: mockRequest } as any);

			expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600');
		});

		it('uses default Cache-Control if not provided by PocketBase', async () => {
			mockFetch.mockResolvedValue({
				status: 200,
				body: new ReadableStream(),
				headers: { get: vi.fn(() => null) },
			});

			const response = await GET({ params: mockParams, request: mockRequest } as any);

			expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000');
		});

		it('returns Content-Length header from PocketBase', async () => {
			mockFetch.mockResolvedValue({
				status: 200,
				body: new ReadableStream(),
				headers: {
					get: vi.fn((header: string) => {
						if (header === 'Content-Length') return '54321';
						return null;
					}),
				},
			});

			const response = await GET({ params: mockParams, request: mockRequest } as any);

			expect(response.headers.get('Content-Length')).toBe('54321');
		});

		it('uses default Content-Length if not provided by PocketBase', async () => {
			mockFetch.mockResolvedValue({
				status: 200,
				body: new ReadableStream(),
				headers: { get: vi.fn(() => null) },
			});

			const response = await GET({ params: mockParams, request: mockRequest } as any);

			expect(response.headers.get('Content-Length')).toBe('0');
		});

		it('handles 404 from PocketBase', async () => {
			mockFetch.mockResolvedValue({
				status: 404,
				body: new ReadableStream(),
				headers: { get: vi.fn(() => null) },
			});

			const response = await GET({ params: mockParams, request: mockRequest } as any);

			expect(response.status).toBe(404);
		});

		it('handles different file paths correctly', async () => {
			mockParams.path = 'users/user456/avatar.png';

			mockFetch.mockResolvedValue({
				status: 200,
				body: new ReadableStream(),
				headers: { get: vi.fn(() => null) },
			});

			await GET({ params: mockParams, request: mockRequest } as any);

			expect(mockFetch).toHaveBeenCalledWith(
				'http://127.0.0.1:8090/api/files/users/user456/avatar.png',
				expect.any(Object)
			);
		});

		it('handles deeply nested paths', async () => {
			mockParams.path = 'collection/id/folder/subfolder/file.pdf';

			mockFetch.mockResolvedValue({
				status: 200,
				body: new ReadableStream(),
				headers: { get: vi.fn(() => null) },
			});

			await GET({ params: mockParams, request: mockRequest } as any);

			expect(mockFetch).toHaveBeenCalledWith(
				'http://127.0.0.1:8090/api/files/collection/id/folder/subfolder/file.pdf',
				expect.any(Object)
			);
		});
	});
});
