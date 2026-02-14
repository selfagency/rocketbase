import { postSchema } from '$lib/schemas/post';
import type { PostsResponseWithExpanded } from '$lib/types/pocketbase-expanded';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

function toDateTimeLocal(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
}

function normalizeDateInput(dateString: string): string | null {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function relationIds(values: unknown[]): string[] {
  return values
    .map(value => {
      if (typeof value === 'string') return value;
      if (value && typeof value === 'object' && 'id' in value) {
        const id = (value as { id?: string }).id;
        return id || null;
      }
      return null;
    })
    .filter((id): id is string => Boolean(id));
}

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) error(401, 'Unauthorized');
  if (locals.user.role !== 'admin' && locals.user.role !== 'editor') {
    error(403, 'Forbidden - Requires editor or admin role');
  }

  try {
    const [post, users, tags] = await Promise.all([
      locals.pb.collection('posts').getOne<PostsResponseWithExpanded>(params.id, {
        expand: 'author,tags,attachments',
      }),
      locals.pb.collection('users').getFullList({
        filter: 'role != "user"',
        fields: 'id,name,email',
      }),
      locals.pb.collection('tags').getFullList({
        fields: 'id,tag,slug',
      }),
    ]);

    const expandedAuthor = Array.isArray((post as any).expand?.author) ? (post as any).expand.author : [];
    const expandedTags = Array.isArray((post as any).expand?.tags) ? (post as any).expand.tags : [];

    const authorIds = relationIds(expandedAuthor.length > 0 ? expandedAuthor : (post.author as any) || []);
    const tagIds = relationIds(expandedTags.length > 0 ? expandedTags : (post.tags as any) || []);

    const form = await superValidate(
      {
        title: post.title || '',
        slug: post.slug,
        summary: post.summary || '',
        content: post.content || '',
        date: toDateTimeLocal(post.date),
        embed: post.embed || '',
        enclosure: post.enclosure || '',
        published: post.published || false,
        visible: post.visible || true,
        require_login: post.require_login || false,
        subscriber_only: post.subscriber_only || false,
        author: authorIds,
        tags: tagIds,
        attachments: post.attachments || [],
      },
      zod4(postSchema)
    );

    return {
      post,
      form,
      authors: users.map(user => ({ id: user.id, name: user.name || user.email || 'Unknown' })),
      tags: tags.map(tag => ({ id: tag.id, name: tag.tag || tag.slug || 'untagged' })),
    };
  } catch {
    error(404, 'Post not found');
  }
};

export const actions: Actions = {
  default: async ({ locals, params, request }) => {
    const formData = await request.formData();
    const form = await superValidate(formData, zod4(postSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const normalizedDate = normalizeDateInput(form.data.date);
    if (!normalizedDate) {
      return fail(400, {
        form,
        error: 'Invalid publish date',
      });
    }

    try {
      const pbFormData = new FormData();
      pbFormData.append('title', form.data.title);
      pbFormData.append('slug', form.data.slug);
      if (form.data.summary) pbFormData.append('summary', form.data.summary);
      if (form.data.content) pbFormData.append('content', form.data.content);
      pbFormData.append('date', normalizedDate);
      if (form.data.embed) pbFormData.append('embed', form.data.embed);
      if (form.data.enclosure) pbFormData.append('enclosure', form.data.enclosure);
      pbFormData.append('published', form.data.published.toString());
      pbFormData.append('visible', form.data.visible.toString());
      pbFormData.append('require_login', form.data.require_login.toString());
      pbFormData.append('subscriber_only', form.data.subscriber_only.toString());

      for (const authorId of form.data.author) {
        pbFormData.append('author', authorId);
      }

      for (const tagId of form.data.tags || []) {
        pbFormData.append('tags', tagId);
      }

      const image = formData.get('image') as File;
      if (image && image.size > 0) {
        pbFormData.append('image', image);
      }

      const attachmentIds = [...(form.data.attachments ?? [])];
      const mediaFiles = formData.getAll('media') as File[];
      for (const file of mediaFiles) {
        if (!file || file.size === 0) continue;

        const mediaFormData = new FormData();
        mediaFormData.append('file', file);
        if (locals.user?.id) {
          mediaFormData.append('uploaded_by', locals.user.id);
        }

        const mediaRecord = await locals.pb.collection('media').create(mediaFormData);
        attachmentIds.push(mediaRecord.id);
      }

      for (const attachmentId of attachmentIds) {
        if (attachmentId) {
          pbFormData.append('attachments', attachmentId);
        }
      }

      await locals.pb.collection('posts').update(params.id, pbFormData);
    } catch (err) {
      const pbError = err as Error;
      return fail(500, {
        form,
        error: pbError.message || 'Failed to update post',
      });
    }

    redirect(303, `/admin/posts/${params.id}`);
  },
};
