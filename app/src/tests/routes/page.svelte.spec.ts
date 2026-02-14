import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import Page from '../../routes/+page.svelte';

describe('/+page.svelte', () => {
  it('should render h1', async () => {
    render(Page, {
      props: {
        data: {
          navItems: [],
          user: null,
          page: null,
          url: 'http://localhost:5173',
          metadata: {},
        },
      },
    });

    const heading = page.getByRole('heading', { level: 1 });
    await expect.element(heading).toBeInTheDocument();
  });

  it('renders authenticated user actions when user exists', async () => {
    render(Page, {
      props: {
        data: {
          navItems: [],
          user: { name: 'Alex', email: 'alex@example.com' },
          page: null,
          url: 'http://localhost:5173',
          metadata: {},
        } as any,
      },
    });

    await expect.element(page.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    await expect.element(page.getByRole('link', { name: /account settings/i })).toBeInTheDocument();
  });

  it('renders page content block when data.page is present', async () => {
    render(Page, {
      props: {
        data: {
          navItems: [],
          user: null,
          page: {
            id: 'p1',
            title: 'Landing Content',
            summary: 'Summary',
            slug: 'landing-content',
            content: '<p>Hello</p>',
            custom_css: '',
            image: '',
            media: [],
            updated: new Date().toISOString(),
            created: new Date().toISOString(),
          },
          url: 'http://localhost:5173',
          metadata: {},
        } as any,
      },
    });

    await expect.element(page.getByRole('heading', { name: 'Landing Content' })).toBeInTheDocument();
  });
});
