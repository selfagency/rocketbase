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
});
