import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Nav from '../../../../lib/components/global/Nav.svelte';

describe('Nav.svelte', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation wrapper with proper structure', () => {
    const { container } = render(Nav, {
      props: {
        navItems: [],
      },
    });

    const nav = container.querySelector('nav[aria-label="Primary"]');
    expect(nav).toBeTruthy();
  });

  it('applies fixed and z-index positioning classes', () => {
    const { container } = render(Nav, {
      props: {
        navItems: [],
      },
    });

    const nav = container.querySelector('nav');
    const classStr = nav?.className || '';
    expect(classStr).toContain('fixed');
    expect(classStr).toContain('z-40');
  });

  it('applies visual styling classes', () => {
    const { container } = render(Nav, {
      props: {
        navItems: [],
      },
    });

    const nav = container.querySelector('nav');
    const classStr = nav?.className || '';
    expect(classStr).toContain('border');
    expect(classStr).toContain('shadow-md');
  });

  it('applies backdrop styling', () => {
    const { container } = render(Nav, {
      props: {
        navItems: [],
      },
    });

    const nav = container.querySelector('nav');
    const classStr = nav?.className || '';
    expect(classStr).toContain('backdrop-blur-md');
  });

  it('renders navigation list structure', () => {
    const { container } = render(Nav, {
      props: {
        navItems: [],
      },
    });

    const navList = container.querySelector('nav ul');
    expect(navList).toBeTruthy();
  });

  it('renders with default props when navItems undefined', () => {
    const { container } = render(Nav);

    const nav = container.querySelector('nav');
    expect(nav).toBeTruthy();
  });

  it('renders navigation items when provided', () => {
    const navItems = [
      {
        id: 'item-1',
        title: 'About',
        slug: 'about',
        children: [],
      },
    ];

    const { container } = render(Nav, {
      props: { navItems },
    });

    const navText = container.textContent;
    expect(navText).toContain('About');
  });

  it('handles navigation items with children', () => {
    const navItems = [
      {
        id: 'item-1',
        title: 'Main Menu',
        slug: 'main',
        children: [
          {
            id: 'child-1',
            title: 'Submenu',
            slug: 'submenu',
            summary: 'Submenu item',
          },
        ],
      },
    ];

    const { container } = render(Nav, {
      props: { navItems },
    });

    expect(container.querySelector('nav')).toBeTruthy();
  });

  it('handles empty children arrays', () => {
    const navItems = [
      {
        id: 'item-1',
        title: 'Link',
        slug: 'link',
        children: [],
      },
    ];

    const { container } = render(Nav, {
      props: { navItems },
    });

    expect(container.querySelector('nav')).toBeTruthy();
  });

  it('renders flex container with proper spacing', () => {
    const { container } = render(Nav, {
      props: { navItems: [] },
    });

    const flexContainer = container.querySelector('.flex.items-center');
    expect(flexContainer).toBeTruthy();
  });

  it('applies responsive classes', () => {
    const { container } = render(Nav, {
      props: { navItems: [] },
    });

    const nav = container.querySelector('nav');
    const classStr = nav?.className || '';
    expect(classStr).toContain('w-screen');
  });
});
