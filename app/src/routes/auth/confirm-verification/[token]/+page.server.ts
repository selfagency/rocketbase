import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { token } = params;

	if (!token) {
		return {
			error: 'Invalid verification link'
		};
	}

	try {
		await locals.pb.collection('users').confirmVerification(token);
	} catch (err: any) {
		return {
			error: err?.message || 'Failed to verify email. The link may have expired.'
		};
	}

	redirect(303, '/account?verified=true');
};
