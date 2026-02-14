import {
  RESERVED_ROUTE_SEGMENTS,
  getFallthroughAccessError,
  isReservedFallthroughSlug,
} from '$lib/server/page-fallthrough';
import { describe, expect, it } from 'vitest';

describe('page fallthrough helpers', () => {
  it('flags reserved route roots', () => {
    for (const segment of RESERVED_ROUTE_SEGMENTS) {
      expect(isReservedFallthroughSlug(segment)).toBe(true);
      expect(isReservedFallthroughSlug(`${segment}/child`)).toBe(true);
    }
  });

  it('does not flag non-reserved roots', () => {
    expect(isReservedFallthroughSlug('about')).toBe(false);
    expect(isReservedFallthroughSlug('about/team')).toBe(false);
  });

  it('returns auth error for login-required pages', () => {
    expect(getFallthroughAccessError({ require_login: true, subscriber_only: false }, false)).toBe(
      'error.authentication_required'
    );
  });

  it('returns subscriber error for subscriber-only pages', () => {
    expect(getFallthroughAccessError({ require_login: false, subscriber_only: true }, false)).toBe(
      'error.subscriber_access_required'
    );
  });

  it('returns null when user has access', () => {
    expect(getFallthroughAccessError({ require_login: true, subscriber_only: true }, true)).toBeNull();
    expect(getFallthroughAccessError({ require_login: false, subscriber_only: false }, false)).toBeNull();
  });
});
