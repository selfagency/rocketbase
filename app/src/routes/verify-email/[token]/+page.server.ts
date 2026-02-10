import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { token } = params;

  if (!token) {
    return {
      error: 'Invalid verification link',
    };
  }

  try {
    // Confirm email verification with the token
    await locals.pb.collection('users').confirmVerification(token);

    // Redirect to account page with success message
    redirect(303, '/account?verified=true');
  } catch (err: any) {
    locals.logger.withMetadata(err).error('Email verification error');
    return {
      error: err?.message || 'Failed to verify email. The link may have expired.',
    };
  }
};
