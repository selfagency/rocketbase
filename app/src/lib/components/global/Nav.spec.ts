import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Nav from './Nav.svelte';

describe('Nav.svelte', () => {
  it('should render without crashing', async () => {
    const { container } = render(Nav, {
      props: {},
    });

    expect(container).toBeDefined();
  });

  it('renders navigation with simple navItems', async () => {
    const navItems = [
      { id: '1', slug: 'about', title: 'About Us', children: [] },
      { id: '2', slug: 'contact', title: 'Contact', children: [] },
    ];

    const { container } = render(Nav, {
      props: { navItems },
    });

    expect(container.textContent).toContain('About Us');
    expect(container.textContent).toContain('Contact');
  });

  it('renders navigation with nested navItems without errors', async () => {
    const navItems = [
      {
        id: '1',
        slug: 'services',
        title: 'Services',
        children: [
          { id: '1-1', slug: 'web-dev', title: 'Web Development', summary: 'Build modern websites' },
          { id: '1-2', slug: 'consulting', title: 'Consulting', summary: 'Expert advice' },
        ],
      },
    ];

    const { container } = render(Nav, {
      props: { navItems },
    });

    // Verify parent menu item renders and code executes without error
    expect(container.textContent).toContain('Services');
    expect(container).toBeDefined();
  });

  it('renders navigation with multiple nested menus without errors', async () => {
    const navItems = [
      {
        id: '1',
        slug: 'services',
        title: 'Services',
        children: [{ id: '1-1', slug: 'web-dev', title: 'Web Development' }],
      },
      {
        id: '2',
        slug: 'products',
        title: 'Products',
        children: [{ id: '2-1', slug: 'software', title: 'Software', summary: 'Our software offerings' }],
      },
    ];

    const { container } = render(Nav, {
      props: { navItems },
    });

    // Verify parent menu items render and code executes without error
    expect(container.textContent).toContain('Services');
    expect(container.textContent).toContain('Products');
    expect(container).toBeDefined();
  });
});
