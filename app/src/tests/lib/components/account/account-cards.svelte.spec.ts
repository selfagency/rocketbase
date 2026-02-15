import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { writable } from 'svelte/store';

import MfaCard from '../../../../lib/components/account/MfaCard.svelte';

describe('account card components', () => {
  it('renders MFA required state', () => {
    const { container } = render(MfaCard, {
      props: {
        mfaRequired: true,
        mfaFormObj: {},
        mfaForm: writable({ mfaOptIn: false }),
        mfaEnhance: () => undefined,
      },
    });

    expect(container.textContent).toContain('2FA');
  });
});
