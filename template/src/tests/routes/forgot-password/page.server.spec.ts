import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from '../../../routes/forgot-password/+page.server';
import type { RequestEvent } from '@sveltejs/kit';

describe('Forgot Password Server Actions', () => {
	let mockLocals: any;
	let mockEvent: Partial<RequestEvent>;

	beforeEach(() => {
		mockLocals = {
			pb: {
				collection: vi.fn().mockReturnValue({
					requestPasswordReset: vi.fn()
				})
			},
			user: null
		};

		mockEvent = {
			locals: mockLocals,
			request: new Request('http://localhost', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			})
		};
	});

	describe('default action (request password reset)', () => {
		it('successfully sends password reset email', async () => {
			expect.assertions(3);

			const formData = new FormData();
			formData.append('email', 'test@example.com');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			mockLocals.pb.collection().requestPasswordReset.mockResolvedValue({});

			const result: any = await actions.default(mockEvent as any);

			expect(result.success).toBe(true);
			expect(result.message).toContain('password reset link has been sent');
			expect(mockLocals.pb.collection().requestPasswordReset).toHaveBeenCalledWith(
				'test@example.com'
			);
		});

		it('validates email format', async () => {
			expect.assertions(1);

			const formData = new FormData();
			formData.append('email', 'invalid-email');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			const result = await actions.default(mockEvent as any);

			expect(result).toHaveProperty('status', 400);
		});

		it('returns success message even on error (security)', async () => {
			expect.assertions(2);

			const formData = new FormData();
			formData.append('email', 'nonexistent@example.com');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			mockLocals.pb.collection().requestPasswordReset.mockRejectedValue(
				new Error('User not found')
			);

			const result: any = await actions.default(mockEvent as any);

			// Should still return success to not reveal if email exists
			expect(result.success).toBe(true);
			expect(result.message).toContain('password reset link has been sent');
		});

		it('returns error when email field is empty', async () => {
			expect.assertions(1);

			const formData = new FormData();
			formData.append('email', '');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			const result = await actions.default(mockEvent as any);

			expect(result).toHaveProperty('status', 400);
		});
	});
});
