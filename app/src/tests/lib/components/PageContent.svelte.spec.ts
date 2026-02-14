import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PageContent from '../../../lib/components/PageContent.svelte';

describe('PageContent.svelte', () => {
  const createPageData = (overrides?: Record<string, any>) => ({
    id: 'page-1',
    title: 'Test Page',
    summary: 'Test Summary',
    slug: 'test-page',
    content: '<p>Test content</p>',
    custom_css: '',
    image: '',
    media: [],
    updated: new Date().toISOString(),
    created: new Date().toISOString(),
    ...overrides,
  });

  it('renders page title when provided', async () => {
    const { container } = render(PageContent, {
      props: {
        page: createPageData({ title: 'Test Page' }) as any,
      },
    });

    const heading = container.querySelector('h1');
    expect(heading?.textContent).toContain('Test Page');
  });

  it('renders page summary when provided', async () => {
    const { container } = render(PageContent, {
      props: {
        page: createPageData({ summary: 'Test Summary' }) as any,
      },
    });

    const summary = container.textContent;
    expect(summary).toContain('Test Summary');
  });

  it('renders no content message when content is empty', async () => {
    const { container } = render(PageContent, {
      props: {
        page: createPageData({ content: '' }) as any,
      },
    });

    const noContentMsg = container.textContent;
    expect(noContentMsg).toContain("doesn't have any content yet");
  });

  it('renders featured image when provided', async () => {
    const { container } = render(PageContent, {
      props: {
        page: createPageData({ image: 'featured.jpg' }) as any,
      },
    });

    const imgWithClass = container.querySelector('img.u-featured') as HTMLImageElement | null;
    expect(imgWithClass).toBeTruthy();
    expect(imgWithClass?.src).toContain('featured.jpg');
  });

  it('renders media section when media array has items', async () => {
    const { container } = render(PageContent, {
      props: {
        page: createPageData({ media: ['media1.jpg', 'media2.jpg'] }) as any,
      },
    });

    const mediaHeading = container.querySelector('h2');
    expect(mediaHeading?.textContent).toContain('Media');

    const mediaImages = container.querySelectorAll('img[alt*="Media file"]');
    expect(mediaImages.length).toBe(2);
  });

  it('hides media section when media array is empty', async () => {
    const { container } = render(PageContent, {
      props: {
        page: createPageData({ media: [] }) as any,
      },
    });

    const mediaHeading = Array.from(container.querySelectorAll('h2')).find(h => h.textContent?.includes('Media'));
    expect(mediaHeading).toBeFalsy();
  });

  it('displays last updated date', async () => {
    const { container } = render(PageContent, {
      props: {
        page: createPageData() as any,
      },
    });

    const lastUpdated = container.textContent;
    expect(lastUpdated).toContain('Last updated');
  });

  it('renders microformat h-entry class for IndieWeb', async () => {
    const { container } = render(PageContent, {
      props: {
        page: createPageData() as any,
      },
    });

    const article = container.querySelector('article.h-entry');
    expect(article).toBeTruthy();
  });

  it('renders custom CSS when provided', async () => {
    const customCss = '.custom { color: red; }';
    const { container } = render(PageContent, {
      props: {
        page: createPageData({ custom_css: customCss }) as any,
      },
    });

    const styleTag = container.querySelector('style');
    expect(styleTag?.textContent).toBe(customCss);
  });

  it('renders home button in footer', async () => {
    const { container } = render(PageContent, {
      props: {
        page: createPageData() as any,
      },
    });

    const homeButton = container.querySelector('a[href="/"]');
    expect(homeButton).toBeTruthy();
    expect(homeButton?.textContent).toContain('Home');
  });

  it('renders page structure with container and article', async () => {
    const { container } = render(PageContent, {
      props: {
        page: createPageData() as any,
      },
    });

    expect(container.querySelector('.container')).toBeTruthy();
    expect(container.querySelector('article')).toBeTruthy();
  });
});
