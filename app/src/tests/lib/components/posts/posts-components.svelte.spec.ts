import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import PostCard from '../../../../lib/components/posts/PostCard.svelte';
import PostHeader from '../../../../lib/components/posts/PostHeader.svelte';
import PostList from '../../../../lib/components/posts/PostList.svelte';

const basePost = {
  id: 'post-1',
  slug: 'hello-world',
  title: 'Hello World',
  summary: 'A short summary',
  date: '2026-02-15T08:00:00.000Z',
  created: '2026-02-15T08:00:00.000Z',
  updated: '2026-02-15T08:00:00.000Z',
  image: '',
  content: '<p>Hi</p>',
  published: true,
  visible: true,
  author: [{ id: 'u1', name: 'Ada Lovelace', email: 'ada@example.com', avatar: '' }],
  tags: [{ id: 't1', tag: 'svelte', slug: 'svelte' }],
} as any;

describe('post display components', () => {
  it('renders PostCard with title, summary, author and tags', () => {
    const { container } = render(PostCard, {
      props: {
        post: basePost,
        showAuthor: true,
      },
    });

    expect(container.textContent).toContain('Hello World');
    expect(container.textContent).toContain('A short summary');
    expect(container.textContent).toContain('Ada Lovelace');
    expect(container.textContent).toContain('#svelte');
  });

  it('renders PostHeader with permalink and metadata', () => {
    const { container } = render(PostHeader, {
      props: { post: basePost },
    });

    expect(container.querySelector('a.u-url.u-uid')?.getAttribute('href')).toBe('/posts/hello-world');
    expect(container.textContent).toContain('Hello World');
    expect(container.textContent).toContain('Ada Lovelace');
  });

  it('renders empty PostList state', () => {
    const { container } = render(PostList, {
      props: {
        posts: [],
        pagination: {
          page: 1,
          perPage: 10,
          totalItems: 0,
          totalPages: 0,
        },
      },
    });

    expect(container.textContent).toContain('No posts found');
  });

  it('renders PostList with items', () => {
    const { container } = render(PostList, {
      props: {
        posts: [basePost],
        pagination: {
          page: 1,
          perPage: 10,
          totalItems: 1,
          totalPages: 1,
        },
      },
    });

    expect(container.textContent).toContain('Hello World');
  });
});
