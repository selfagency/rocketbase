import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Redirect to home if accessed via GET
  redirect(303, '/');
};

export const actions: Actions = {
  default: async ({ locals }) => {
    locals.pb.authStore.clear();
    locals.user = null;
    redirect(303, '/?logout=success');
  },
};
