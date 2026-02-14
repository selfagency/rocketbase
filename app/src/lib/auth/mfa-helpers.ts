/**
 * MFA (Multi-Factor Authentication) helper functions for login flows
 */

import * as m from '$lib/paraglide/messages.js';
import type PocketBase from 'pocketbase';
import type { LogLayer } from 'loglayer';
import type { SuperValidated } from 'sveltekit-superforms';
import { fail } from '@sveltejs/kit';

export interface MfaVerificationParams {
	email: string;
	password: string;
	code: string;
	mfaId: string;
	otpId: string;
	pb: PocketBase;
	logger: LogLayer;
	requestId?: string;
	route: string;
}

export interface PasswordAuthParams {
	email: string;
	password: string;
	pb: PocketBase;
	logger: LogLayer;
	requestId?: string;
	route: string;
}

export interface MfaRequestParams {
	email: string;
	password: string;
	mfaId: string;
	pb: PocketBase;
	logger: LogLayer;
	requestId?: string;
	route: string;
}

/**
 * Verify MFA code during login
 * @throws Redirects on success
 * @returns ActionFailure on error
 */
export async function verifyMfaCode<T extends Record<string, any>>(
	params: MfaVerificationParams,
	form: SuperValidated<T>
): Promise<any> {
	const { email, password, code, mfaId, otpId, pb, logger, requestId, route } = params;

	try {
		logger.debug('=== MFA Verification ===');
		logger.withMetadata({ email, codeLength: code.length }).debug('Verifying OTP');

		const authData = await pb.collection('users').authWithOTP(otpId, code, { mfaId } as any);

		// Verify auth actually returned valid data (defensive check)
		if (!authData?.token || !pb.authStore.isValid) {
			pb.authStore.clear();
			form.message = m['auth.login.invalid_credentials']();
			return fail(400, { form });
		}

		// Check if account is disabled
		if (authData.record.disabled) {
			pb.authStore.clear();
			form.message = m['auth.login.account_disabled']();
			return fail(403, { form });
		}

		// Successful MFA verification
		logger.debug('MFA verification successful');
		return { success: true, redirect: '/?login=success' };
	} catch (err: any) {
		logger
			.withContext({
				route,
				userId: pb?.authStore?.record?.id,
				requestId
			})
			.withMetadata(err)
			.error('MFA verification error');

		const errorMsg = err?.response?.message || err?.message;
		form.message = `${m['auth.mfa_invalid_code']()} - ${errorMsg || 'Unknown error'}`;

		// Keep all form data so user can retry
		(form.data as any).email = email;
		(form.data as any).password = password;
		(form.data as any).mfaId = mfaId;
		(form.data as any).otpId = otpId;

		return fail(400, { form });
	}
}

/**
 * Authenticate with password (may trigger MFA flow)
 * @throws Redirects on success or if MFA required
 * @returns ActionFailure on error or MFA requirement
 */
export async function authenticateWithPassword<T extends Record<string, any>>(
	params: PasswordAuthParams,
	form: SuperValidated<T>
): Promise<any> {
	const { email, password, pb, logger, requestId, route } = params;

	try {
		try {
			console.log('[login] attempting authWithPassword', {
				email,
				route,
				requestId
			});
		} catch (e) {
			// Ignore console errors
		}

		logger.withContext({ route, requestId, email }).debug('Attempting authWithPassword');

		const authData = await pb.collection('users').authWithPassword(email, password);

		// Verify auth actually returned valid data
		if (!authData?.token || !pb.authStore.isValid) {
			pb.authStore.clear();
			form.message = m['auth.login.invalid_credentials']();
			return fail(400, { form });
		}

		// Check if account is disabled
		if (authData.record.disabled) {
			pb.authStore.clear();
			form.message = m['auth.login.account_disabled']();
			return fail(403, { form });
		}

		// Successful login without MFA
		try {
			console.log('[login] password auth successful', { userId: authData.record?.id, email });
		} catch (e) {
			// Ignore console errors
		}

		logger
			.withContext({
				route,
				requestId,
				userId: authData.record?.id
			})
			.info('Password auth successful, redirecting to home');

		return { success: true, redirect: '/?login=success' };
	} catch (err: any) {
		logger
			.withContext({
				route,
				userId: pb?.authStore?.record?.id,
				requestId
			})
			.withMetadata(err)
			.error('Login error');

		// Check if MFA is required
		const mfaIdFromError = err?.response?.mfaId;
		if (mfaIdFromError) {
			// MFA is required - request OTP
			return await requestMfaOtp(
				{ email, password, mfaId: mfaIdFromError, pb, logger, requestId, route },
				form
			);
		}

		// Regular login error
		try {
			console.log('[login] password auth failed', { email, err: err?.message || String(err) });
		} catch (e) {
			// Ignore console errors
		}

		logger
			.withContext({ route, requestId })
			.debug('Password auth failed, returning error to client', err);

		form.message = m['auth.login.invalid_credentials']();
		return fail(400, { form });
	}
}

/**
 * Request OTP for MFA authentication
 * @returns ActionFailure with MFA form data populated
 */
async function requestMfaOtp<T extends Record<string, any>>(
	params: MfaRequestParams,
	form: SuperValidated<T>
): Promise<any> {
	const { email, password, mfaId, pb, logger, requestId, route } = params;

	try {
		logger
			.withContext({
				route,
				userId: pb?.authStore?.record?.id,
				requestId,
				email
			})
			.debug('MFA required, requesting OTP');

		const otpResponse = await pb.collection('users').requestOTP(email, {
			mfaId
		} as any);

		logger
			.withContext({
				route,
				userId: pb?.authStore?.record?.id,
				requestId
			})
			.debug('OTP request successful');

		logger
			.withContext({
				route,
				userId: pb?.authStore?.record?.id,
				requestId,
				otpId: otpResponse.otpId
			})
			.debug('OTP sent');

		// Store MFA data and credentials in form for next submission
		(form.data as any).email = email;
		(form.data as any).password = password;
		(form.data as any).mfaId = mfaId;
		(form.data as any).otpId = otpResponse.otpId;
		form.message = m['auth.mfa_code_required']();

		return fail(400, { form });
	} catch (otpErr) {
		logger
			.withContext({
				route,
				userId: pb?.authStore?.record?.id,
				requestId
			})
			.withMetadata({ error: otpErr })
			.error('OTP request error');

		form.message = m['auth.mfa_send_failed']();
		return fail(400, { form });
	}
}
