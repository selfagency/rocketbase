import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals, request }) => {
  // Require auth and editor/admin role
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
  if (locals.user.role !== 'admin' && locals.user.role !== 'editor') {
    return json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const order: string[] = body?.order || [];
    if (!Array.isArray(order)) {
      return json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Persist order values
    for (let i = 0; i < order.length; i++) {
      const id = order[i];
      try {
        await locals.pb.collection('pages').update(id, { order: i + 1 });
      } catch (err) {
        // Log and continue
        console.error('Failed to update page order for', id, err);
      }
    }

    return json({ success: true });
  } catch (err) {
    console.error('Failed to handle reorder', err);
    return json({ error: 'Server error' }, { status: 500 });
  }
};
