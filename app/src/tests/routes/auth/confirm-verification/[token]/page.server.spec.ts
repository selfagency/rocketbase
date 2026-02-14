import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from '../../../../../routes/auth/confirm-verification/[token]/+page.server';

// Mock paraglide messages
vi.mock('$lib/paraglide/messages.js', () => ({
	'verify.invalid_verification_link': () => 'Invalid verification link',
	'verify.email_verification_failed': () => 'Email verification failed',
}));

describe('Auth Confirm Verification Page Server', () => {
	let mockLocals: any;
	let mockParams: any;

	beforeEach(() => {
		const mockCollection = {
			confirmVerification: vi.fn(),
		};

		mockLocals = {
			pb: {
				collection: vi.fn(() => mockCollection),
			},
		};

		vi.clearAllMocks();
	});

	describe('load function', () => {
		it('successfully verifies email with valid token', async () => {
			mockParams = { token: 'valid-token-123' };
			mockLocals.pb.collection().confirmVerification.mockResolvedValue(undefined);

			await expect(load({ params: mockParams, locals: mockLocals } as any)).rejects.toThrow();

			expect(mockLocals.pb.collection).toHaveBeenCalledWith('users');
			expect(mockLocals.pb.collection().confirmVerification).toHaveBeenCalledWith('valid-token-123');
		});

		it('redirects to account page with verified param on success', async () => {
			mockParams = { token: 'valid-token' };
			mockLocals.pb.collection().confirmVerification.mockResolvedValue(undefined);

			try {
				await load({ params: mockParams, locals: mockLocals } as any);
			} catch (error: any) {
				expect(error.status).toBe(303);
				expect(error.location).toBe('/account?verified=true');
			}
		});

		it('returns error when token is missing', async () => {
			mockParams = { token: '' };

			const result = await load({ params: mockParams, locals: mockLocals } as any);

			expect(result).toEqual({
				error: 'Invalid verification link',
			});
			expect(mockLocals.pb.collection().confirmVerification).not.toHaveBeenCalled();
		});

		it('returns error when token is undefined', async () => {
			mockParams = { token: undefined };

			const result = await load({ params: mockParams, locals: mockLocals } as any);

			expect(result).toEqual({
				error: 'Invalid verification link',
			});
		});

		it('returns error when token is null', async () => {
			mockParams = { token: null };

			const result = await load({ params: mockParams, locals: mockLocals } as any);

			expect(result).toEqual({
				error: 'Invalid verification link',
			});
		});

		it('handles PocketBase verification error', async () => {
			mockParams = { token: 'invalid-token' };

			const pbError = new Error('Token expired');
			mockLocals.pb.collection().confirmVerification.mockRejectedValue(pbError);

			const result = await load({ params: mockParams, locals: mockLocals } as any);

			expect(result).toEqual({
				error: 'Token expired',
			});
		});

		it('uses default error message when PocketBase error has no message', async () => {
			mockParams = { token: 'token' };
			mockLocals.pb.collection().confirmVerification.mockRejectedValue({});

			const result = await load({ params: mockParams, locals: mockLocals } as any);

			expect(result).toEqual({
				error: 'Email verification failed',
			});
		});

		it('handles error object without message property', async () => {
			mockParams = { token: 'token' };
			mockLocals.pb.collection().confirmVerification.mockRejectedValue({ status: 400 });

			const result = await load({ params: mockParams, locals: mockLocals } as any);

			expect(result.error).toBe('Email verification failed');
		});

		it('redirects after successful verification', async () => {
			mockParams = { token: 'abc-123' };
			mockLocals.pb.collection().confirmVerification.mockResolvedValue(undefined);

			try {
				await load({ params: mockParams, locals: mockLocals } as any);
				expect.fail('Should have thrown redirect');
			} catch (error: any) {
				expect(error.status).toBe(303);
				expect(error.location).toBe('/account?verified=true');
			}
		});

		it('calls confirmVerification on users collection', async () => {
			mockParams = { token: 'test-token' };
			mockLocals.pb.collection().confirmVerification.mockResolvedValue(undefined);

			try {
				await load({ params: mockParams, locals: mockLocals } as any);
			} catch {
				// Expected redirect
			}

			expect(mockLocals.pb.collection).toHaveBeenCalledWith('users');
		});

		it('does not redirect when token is missing', async () => {
			mockParams = { token: '' };

			const result = await load({ params: mockParams, locals: mockLocals } as any);

			expect(result).toHaveProperty('error');
			expect(mockLocals.pb.collection().confirmVerification).not.toHaveBeenCalled();
		});

		it('does not redirect when verification fails', async () => {
			mockParams = { token: 'bad-token' };
			mockLocals.pb.collection().confirmVerification.mockRejectedValue(new Error('Failed'));

			const result = await load({ params: mockParams, locals: mockLocals } as any);

			expect(result).toHaveProperty('error');
			expect(result.error).toBe('Failed');
		});

		it('handles different token formats', async () => {
			mockParams = { token: 'xyz-789-abc-123' };
			mockLocals.pb.collection().confirmVerification.mockResolvedValue(undefined);

			try {
				await load({ params: mockParams, locals: mockLocals } as any);
			} catch (error: any) {
				expect(error.location).toBe('/account?verified=true');
			}

			expect(mockLocals.pb.collection().confirmVerification).toHaveBeenCalledWith('xyz-789-abc-123');
		});

		it('returns error for expired token', async () => {
			mockParams = { token: 'expired-token' };

			const expiredError: any = new Error('Token has expired');
			expiredError.status = 400;
			mockLocals.pb.collection().confirmVerification.mockRejectedValue(expiredError);

			const result = await load({ params: mockParams, locals: mockLocals } as any);

			expect(result.error).toBe('Token has expired');
		});

		it('returns error for already verified token', async () => {
			mockParams = { token: 'already-verified' };

			const alreadyVerifiedError = new Error('Email already verified');
			mockLocals.pb.collection().confirmVerification.mockRejectedValue(alreadyVerifiedError);

			const result = await load({ params: mockParams, locals: mockLocals } as any);

			expect(result.error).toBe('Email already verified');
		});
	});
});
