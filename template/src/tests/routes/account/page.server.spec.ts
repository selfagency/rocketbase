import type { RequestEvent } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actions, load } from '../../../routes/account/+page.server';

describe('Account Server Actions', () => {
	let mockLocals: any;
	let mockEvent: Partial<RequestEvent>;
	const mockUser = {
		id: 'user-123',
		email: 'test@example.com',
		name: 'Test User',
		title: 'Developer',
		bio: 'Test bio',
		website: 'https://example.com',
		avatar: ''
	};

	beforeEach(() => {
		mockLocals = {
			pb: {
				collection: vi.fn().mockReturnValue({
					update: vi.fn(),
					authRefresh: vi.fn(),
					requestOTP: vi.fn(),
					authWithOTP: vi.fn(),
					getFullList: vi.fn(),
					create: vi.fn(),
					delete: vi.fn()
				}),
				authStore: {
					record: mockUser
				}
			},
			user: mockUser
		};

		mockEvent = {
			locals: mockLocals,
			request: new Request('http://localhost', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			})
		};
	});

	describe('load function', () => {
		it('redirects to login when user is not authenticated', async () => {
			expect.assertions(2);

			mockLocals.user = null;

			try {
				await load(mockEvent as any);
			} catch (error: any) {
				expect(error.status).toBe(303);
				expect(error.location).toBe('/login');
			}
		});

		it('loads user data and checks 2FA status', async () => {
			expect.assertions(3);

			mockLocals.pb.collection().getFullList.mockResolvedValue([]);

			const result: any = await load(mockEvent as any);

			expect(result.user).toEqual(mockUser);
			expect(result.twoFactorEnabled).toBe(false);
			expect(mockLocals.pb.collection).toHaveBeenCalledWith('_mfas');
		});

		it('detects when 2FA is enabled', async () => {
			expect.assertions(1);

			mockLocals.pb.collection().getFullList.mockResolvedValue([{ id: 'mfa-1', method: 'otp' }]);

			const result: any = await load(mockEvent as any);

			expect(result.twoFactorEnabled).toBe(true);
		});
	});

	describe('updateProfile action', () => {
		it('successfully updates user profile', async () => {
			expect.assertions(3);

			const formData = new FormData();
			formData.append('name', 'Updated Name');
			formData.append('email', 'updated@example.com');
			formData.append('title', 'Senior Developer');
			formData.append('bio', 'Updated bio');
			formData.append('website', 'https://updated.com');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			mockLocals.pb.collection().update.mockResolvedValue({ ...mockUser, name: 'Updated Name' });
			mockLocals.pb.collection().authRefresh.mockResolvedValue({});

			const result: any = await actions.updateProfile(mockEvent as any);

			expect(result.success).toBe(true);
			expect(mockLocals.pb.collection().update).toHaveBeenCalledWith(
				'user-123',
				expect.any(Object)
			);
			expect(mockLocals.pb.collection().authRefresh).toHaveBeenCalled();
		});

		it('validates name minimum length', async () => {
			expect.assertions(1);

			const formData = new FormData();
			formData.append('name', 'A');
			formData.append('email', 'test@example.com');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			const result = await actions.updateProfile(mockEvent as any);

			expect(result).toHaveProperty('status', 400);
		});

		it('validates email format', async () => {
			expect.assertions(1);

			const formData = new FormData();
			formData.append('name', 'Test User');
			formData.append('email', 'invalid-email');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			const result = await actions.updateProfile(mockEvent as any);

			expect(result).toHaveProperty('status', 400);
		});

		it('validates website URL format', async () => {
			expect.assertions(1);

			const formData = new FormData();
			formData.append('name', 'Test User');
			formData.append('email', 'test@example.com');
			formData.append('website', 'not-a-url');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			const result = await actions.updateProfile(mockEvent as any);

			expect(result).toHaveProperty('status', 400);
		});

		it('requires authentication', async () => {
			expect.assertions(1);

			mockLocals.user = null;

			const formData = new FormData();
			formData.append('name', 'Test');
			formData.append('email', 'test@example.com');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			const result = await actions.updateProfile(mockEvent as any);

			expect(result).toHaveProperty('status', 401);
		});
	});

	describe('requestTwoFactor action', () => {
		it('successfully requests OTP code', async () => {
			expect.assertions(3);

			const formData = new FormData();
			formData.append('email', 'test@example.com');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			mockLocals.pb.collection().requestOTP.mockResolvedValue({ otpId: 'otp-123' });

			const result: any = await actions.requestTwoFactor(mockEvent as any);

			expect(result.otpId).toBe('otp-123');
			expect(result.otpRequested).toBe(true);
			expect(mockLocals.pb.collection().requestOTP).toHaveBeenCalledWith('test@example.com');
		});

		it('requires authentication', async () => {
			expect.assertions(1);

			mockLocals.user = null;

			const formData = new FormData();
			formData.append('email', 'test@example.com');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			const result = await actions.requestTwoFactor(mockEvent as any);

			expect(result).toHaveProperty('status', 401);
		});
	});

	describe('verifyTwoFactor action', () => {
		it('successfully enables 2FA with valid code', async () => {
			expect.assertions(3);

			const formData = new FormData();
			formData.append('otpId', 'otp-123');
			formData.append('code', '123456');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			mockLocals.pb
				.collection()
				.getFullList.mockResolvedValue([{ id: 'otp-123', recordRef: 'user-123' }]);
			mockLocals.pb.collection().authWithOTP.mockResolvedValue({});
			mockLocals.pb.collection().create.mockResolvedValue({ id: 'mfa-1' });

			const result: any = await actions.verifyTwoFactor(mockEvent as any);

			expect(result.twoFactorEnabled).toBe(true);
			expect(result.success).toBe(true);
			expect(mockLocals.pb.collection().create).toHaveBeenCalledWith({
				collectionRef: 'users',
				recordRef: 'user-123',
				method: 'otp'
			});
		});

		it('returns error for invalid OTP code', async () => {
			expect.assertions(1);

			const formData = new FormData();
			formData.append('otpId', 'otp-123');
			formData.append('code', '000000');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			mockLocals.pb
				.collection()
				.getFullList.mockResolvedValue([{ id: 'otp-123', recordRef: 'user-123' }]);
			mockLocals.pb.collection().authWithOTP.mockRejectedValue(new Error('Invalid code'));

			const result = await actions.verifyTwoFactor(mockEvent as any);

			expect(result).toHaveProperty('status', 400);
		});

		it('requires authentication', async () => {
			expect.assertions(1);

			mockLocals.user = null;

			const formData = new FormData();
			formData.append('otpId', 'otp-123');
			formData.append('code', '123456');

			mockEvent.request = new Request('http://localhost', {
				method: 'POST',
				body: formData
			});

			const result = await actions.verifyTwoFactor(mockEvent as any);

			expect(result).toHaveProperty('status', 401);
		});
	});

	describe('disableTwoFactor action', () => {
		it('successfully disables 2FA', async () => {
			expect.assertions(3);

			mockLocals.pb
				.collection()
				.getFullList.mockResolvedValue([{ id: 'mfa-1', recordRef: 'user-123', method: 'otp' }]);
			mockLocals.pb.collection().delete.mockResolvedValue({});

			const result: any = await actions.disableTwoFactor(mockEvent as any);

			expect(result.twoFactorEnabled).toBe(false);
			expect(result.success).toBe(true);
			expect(mockLocals.pb.collection().delete).toHaveBeenCalledWith('mfa-1');
		});

		it('requires authentication', async () => {
			expect.assertions(1);

			mockLocals.user = null;

			const result = await actions.disableTwoFactor(mockEvent as any);

			expect(result).toHaveProperty('status', 401);
		});
	});
});
