import * as m from '$lib/paraglide/messages.js';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { token } = params;

	if (!token) {
		return {
			error: m['verify.invalid_verification_link']()
		};
	}

	try {
		await locals.pb.collection('users').confirmVerification(token);
	} catch (err: any) {
		return {
			error: err?.message || m['verify.email_verification_failed']()
		};
	}

	redirect(303, '/account?verified=true');
};
