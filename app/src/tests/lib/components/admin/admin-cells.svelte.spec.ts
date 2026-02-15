import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import PageActions from '../../../../lib/components/admin/pages/data-table-actions.svelte';
import PageTitleCell from '../../../../lib/components/admin/pages/page-title-cell.svelte';
import PagePublishVisibilityCell from '../../../../lib/components/admin/pages/publish-visibility-cell.svelte';
import PostActions from '../../../../lib/components/admin/posts/data-table-actions.svelte';
import PostTitleCell from '../../../../lib/components/admin/posts/post-title-cell.svelte';
import PostPublishVisibilityCell from '../../../../lib/components/admin/posts/publish-visibility-cell.svelte';
import StatusIndicator from '../../../../lib/components/admin/status-indicator.svelte';
import TooltipProviderHarness from './tooltip-provider-harness.svelte';

describe('admin table cell/action components', () => {
  it('renders status indicator label', () => {
    const { container } = render(TooltipProviderHarness, {
      props: {
        component: StatusIndicator,
        props: { label: 'Published', tone: 'published' },
      },
    });

    expect(container.textContent).toContain('Published');
  });

  it('renders page and post title cells with fallback titles', () => {
    const pageRendered = render(PageTitleCell, {
      props: { title: '', id: 'page-1', depth: 1 },
    });
    const postRendered = render(PostTitleCell, {
      props: { title: '', id: 'post-1' },
    });

    expect(pageRendered.container.querySelector('a')?.getAttribute('href')).toBe('/admin/pages/page-1');
    expect(pageRendered.container.textContent).toContain('Untitled');

    expect(postRendered.container.querySelector('a')?.getAttribute('href')).toBe('/admin/posts/post-1');
    expect(postRendered.container.textContent).toContain('Untitled');
  });

  it('renders publish/visibility cells for pages and posts', () => {
    const pageRendered = render(TooltipProviderHarness, {
      props: {
        component: PagePublishVisibilityCell,
        props: { published: false, visible: false },
      },
    });
    const postRendered = render(TooltipProviderHarness, {
      props: {
        component: PostPublishVisibilityCell,
        props: { published: true, visible: true },
      },
    });

    expect(pageRendered.container.textContent).toContain('Draft');
    expect(pageRendered.container.textContent).toContain('Hidden');
    expect(postRendered.container.textContent).toContain('Published');
  });

  it('renders page/post action forms with expected ids and endpoints', () => {
    const page = {
      id: 'page-1',
      title: 'Page One',
      in_trash: false,
    } as any;

    const post = {
      id: 'post-1',
      title: 'Post One',
      slug: 'post-one',
      in_trash: true,
    } as any;

    const pageRendered = render(PageActions, { props: { page } });
    const postRendered = render(PostActions, { props: { post } });

    expect(
      pageRendered.container.querySelector('form[action="?/delete"] input[name="id"]')?.getAttribute('value')
    ).toBe('page-1');
    expect(
      pageRendered.container.querySelector('form[action="?/undelete"] input[name="id"]')?.getAttribute('value')
    ).toBe('page-1');

    expect(
      postRendered.container.querySelector('form[action="?/delete"] input[name="id"]')?.getAttribute('value')
    ).toBe('post-1');
    expect(
      postRendered.container.querySelector('form[action="?/undelete"] input[name="id"]')?.getAttribute('value')
    ).toBe('post-1');
  });
});
