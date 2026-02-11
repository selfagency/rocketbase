import type { RequestEvent } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actions } from '../../../routes/register/+page.server';

describe('Register Server Actions', () => {
	let mockLocals: any;
	let mockEvent: Partial<RequestEvent>;

	beforeEach(() => {
		const mockCollection = {
			create: vi.fn(),
			authWithPassword: vi.fn()
		};

		mockLocals = {
			pb: {
				collection: vi.fn(() => mockCollection)
			},
			logger: {
				withContext: vi.fn().mockReturnThis(),
				withMetadata: vi.fn().mockReturnThis(),
				error: vi.fn(),
				info: vi.fn(),
				warn: vi.fn()
			},
			user: null
		};

		// Reset mocks
		vi.clearAllMocks();

		mockEvent = {
			locals: mockLocals,
			request: new Request('http://localhost', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			}),
			url: new URL('http://localhost/register')
		};
	});

	describe('default action (register)', () => {
		it('successfully creates user and redirects to login', async () => {
			const formData = new FormData();
			formData.append('name', 'Test User');
			formData.append('email', 'test@example.com');
			formData.append('password', 'password123');
			formData.append('passwordConfirm', 'password123');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
			mockLocals.pb.collection().create.mockResolvedValue(mockUser);

			try {
				await actions.register(mockEvent as any);
			} catch (error: any) {
				// Expecting a redirect to login page
				expect(error.status).toBe(303);
				expect(error.location).toBe('/login?registered=true');
			}

			expect(mockLocals.pb.collection().create).toHaveBeenCalledWith({
				email: 'test@example.com',
				password: 'password123',
				passwordConfirm: 'password123',
				name: 'Test User',
				role: 'user'
			});
		});

		it('returns error when passwords do not match', async () => {
			const formData = new FormData();
			formData.append('name', 'Test User');
			formData.append('email', 'test@example.com');
			formData.append('password', 'password123');
			formData.append('passwordConfirm', 'different123');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			const result = await actions.register(mockEvent as any);

			expect(result).toHaveProperty('status', 400);
		});

		it('validates email format', async () => {
			const formData = new FormData();
			formData.append('name', 'Test User');
			formData.append('email', 'invalid-email');
			formData.append('password', 'password123');
			formData.append('passwordConfirm', 'password123');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			const result = await actions.register(mockEvent as any);

			expect(result).toHaveProperty('status', 400);
		});

		it('validates password minimum length', async () => {
			const formData = new FormData();
			formData.append('name', 'Test User');
			formData.append('email', 'test@example.com');
			formData.append('password', 'short');
			formData.append('passwordConfirm', 'short');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			const result = await actions.register(mockEvent as any);

			expect(result).toHaveProperty('status', 400);
		});

		it('validates name minimum length', async () => {
			const formData = new FormData();
			formData.append('name', 'A');
			formData.append('email', 'test@example.com');
			formData.append('password', 'password123');
			formData.append('passwordConfirm', 'password123');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			const result = await actions.register(mockEvent as any);

			expect(result).toHaveProperty('status', 400);
		});

		it('handles duplicate email error from PocketBase', async () => {
			const formData = new FormData();
			formData.append('name', 'Test User');
			formData.append('email', 'existing@example.com');
			formData.append('password', 'password123');
			formData.append('passwordConfirm', 'password123');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			const duplicateError: any = new Error('Email already exists');
			duplicateError.message = 'Email already exists';
			mockLocals.pb.collection().create.mockRejectedValue(duplicateError);

			const result: any = await actions.register(mockEvent as any);

			expect(result).toHaveProperty('status', 400);
			expect(result.data.message).toContain('Email already exists');
		});
	});
});
