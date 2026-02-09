import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { token } = await request.json();

		if (!token) {
			return new Response(JSON.stringify({ error: 'Token is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		console.debug('API: Confirming verification with token:', token);

		// Forward to PocketBase to confirm verification
		await locals.pb.collection('users').confirmVerification(token);

		console.debug('API: Email verified successfully');

		return new Response(JSON.stringify({ success: true, message: 'Email verified successfully' }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err: any) {
		console.error('API: Email verification error:', err);
		return new Response(
			JSON.stringify({
				error: err?.message || 'Failed to verify email'
			}),
			{
				status: err?.status || 400,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
