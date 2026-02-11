import * as m from '$lib/paraglide/messages.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const { token } = await request.json();

    if (!token) {
      return new Response(JSON.stringify({ error: m['api.token_required']() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    locals.logger.withMetadata(token).debug('API: Confirming verification with token');

    // Forward to PocketBase to confirm verification
    await locals.pb.collection('users').confirmVerification(token);

    locals.logger.debug('API: Email verified successfully');

    return new Response(JSON.stringify({ success: true, message: 'Email verified successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    locals.logger.withMetadata(err).error('API: Email verification error');
    return new Response(
      JSON.stringify({
        error: err?.message || m['api.email_verification_failed'](),
      }),
      {
        status: err?.status || 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
