import { faqCreateSchema, faqUpdateSchema } from '$lib/schemas/faq';
import type { FaqsResponse } from '$lib/types/pocketbase';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

type ValidationPayload = {
  action: 'create' | 'update';
  message: string;
  fieldErrors: Record<string, string[]>;
};

function ensureAdmin(user: App.Locals['user']) {
  if (!user) {
    redirect(303, '/login');
  }

  if (user.role !== 'admin') {
    error(403, 'You do not have access to FAQ administration.');
  }
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function normalizeFaqInput(parsed: {
  question: string;
  answer: string;
  category?: string;
  slug?: string;
  locale?: string;
  sort_order: number;
  is_published: boolean;
}) {
  return {
    question: parsed.question,
    answer: parsed.answer,
    category: parsed.category || '',
    slug: parsed.slug || '',
    locale: parsed.locale || '',
    sort_order: parsed.sort_order,
    is_published: parsed.is_published,
  };
}

function toValidationPayload(action: ValidationPayload['action'], result: any): ValidationPayload {
  return {
    action,
    message: 'Please fix the validation errors and try again.',
    fieldErrors: result.error.flatten().fieldErrors,
  };
}

export const load: PageServerLoad = async ({ locals }) => {
  ensureAdmin(locals.user);

  const faqs = await locals.pb.collection('faqs').getFullList<FaqsResponse>({
    fields: 'id,question,answer,slug,category,sort_order,is_published,locale,created,updated',
    sort: 'sort_order,created',
  });

  return {
    faqs,
  };
};

export const actions: Actions = {
  create: async ({ locals, request }) => {
    ensureAdmin(locals.user);

    const formData = await request.formData();
    const parsed = faqCreateSchema.safeParse({
      question: getString(formData, 'question'),
      answer: getString(formData, 'answer'),
      category: getString(formData, 'category'),
      slug: getString(formData, 'slug'),
      locale: getString(formData, 'locale') || 'en',
      sort_order: getString(formData, 'sort_order'),
      is_published: formData.get('is_published') === 'on',
    });

    if (!parsed.success) {
      return fail(400, toValidationPayload('create', parsed));
    }

    try {
      await locals.pb.collection('faqs').create(normalizeFaqInput(parsed.data));
      redirect(303, '/admin/faqs?faq=created');
    } catch (err) {
      const pbError = err as Error;
      return fail(500, {
        action: 'create' as const,
        message: pbError.message || 'Failed to create FAQ.',
        fieldErrors: {},
      });
    }
  },

  update: async ({ locals, request }) => {
    ensureAdmin(locals.user);

    const formData = await request.formData();
    const parsed = faqUpdateSchema.safeParse({
      id: getString(formData, 'id'),
      question: getString(formData, 'question'),
      answer: getString(formData, 'answer'),
      category: getString(formData, 'category'),
      slug: getString(formData, 'slug'),
      locale: getString(formData, 'locale') || 'en',
      sort_order: getString(formData, 'sort_order'),
      is_published: formData.get('is_published') === 'on',
    });

    if (!parsed.success) {
      return fail(400, toValidationPayload('update', parsed));
    }

    try {
      await locals.pb.collection('faqs').update(parsed.data.id, normalizeFaqInput(parsed.data));
      redirect(303, '/admin/faqs?faq=updated');
    } catch (err) {
      const pbError = err as Error;
      return fail(500, {
        action: 'update' as const,
        message: pbError.message || 'Failed to update FAQ.',
        fieldErrors: {},
      });
    }
  },

  delete: async ({ locals, request }) => {
    ensureAdmin(locals.user);

    const formData = await request.formData();
    const id = getString(formData, 'id');
    if (!id) {
      return fail(400, {
        action: 'update' as const,
        message: 'Missing FAQ id.',
        fieldErrors: {},
      });
    }

    try {
      await locals.pb.collection('faqs').delete(id);
      redirect(303, '/admin/faqs?faq=deleted');
    } catch (err) {
      const pbError = err as Error;
      return fail(500, {
        action: 'update' as const,
        message: pbError.message || 'Failed to delete FAQ.',
        fieldErrors: {},
      });
    }
  },

  togglePublished: async ({ locals, request }) => {
    ensureAdmin(locals.user);

    const formData = await request.formData();
    const id = getString(formData, 'id');
    const current = getString(formData, 'current') === 'true';

    if (!id) {
      return fail(400, {
        action: 'update' as const,
        message: 'Missing FAQ id.',
        fieldErrors: {},
      });
    }

    try {
      await locals.pb.collection('faqs').update(id, {
        is_published: !current,
      });
      redirect(303, `/admin/faqs?faq=${current ? 'unpublished' : 'published'}`);
    } catch (err) {
      const pbError = err as Error;
      return fail(500, {
        action: 'update' as const,
        message: pbError.message || 'Failed to change publish status.',
        fieldErrors: {},
      });
    }
  },

  move: async ({ locals, request }) => {
    ensureAdmin(locals.user);

    const formData = await request.formData();
    const id = getString(formData, 'id');
    const direction = getString(formData, 'direction');

    if (!id || (direction !== 'up' && direction !== 'down')) {
      return fail(400, {
        action: 'update' as const,
        message: 'Invalid reorder request.',
        fieldErrors: {},
      });
    }

    const faqs = await locals.pb.collection('faqs').getFullList<FaqsResponse>({
      fields: 'id,sort_order,created',
      sort: 'sort_order,created',
    });

    const index = faqs.findIndex(faq => faq.id === id);
    if (index < 0) {
      return fail(404, {
        action: 'update' as const,
        message: 'FAQ not found for reordering.',
        fieldErrors: {},
      });
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) {
      redirect(303, '/admin/faqs?faq=reorder_noop');
    }

    const reordered = [...faqs];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    const updates = reordered
      .map((faq, i) => ({ id: faq.id, sort_order: i }))
      .filter(({ id: faqId, sort_order }) => {
        const original = faqs.find(faq => faq.id === faqId);
        return (original?.sort_order ?? 0) !== sort_order;
      });

    try {
      for (const update of updates) {
        await locals.pb.collection('faqs').update(update.id, {
          sort_order: update.sort_order,
        });
      }

      redirect(303, '/admin/faqs?faq=reordered');
    } catch (err) {
      const pbError = err as Error;
      return fail(500, {
        action: 'update' as const,
        message: pbError.message || 'Failed to reorder FAQs.',
        fieldErrors: {},
      });
    }
  },
};
