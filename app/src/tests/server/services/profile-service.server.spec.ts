import { describe, expect, it, vi } from 'vitest';
import {
  buildUserProfileUpdatePayload,
  updateUserProfile,
  type UpdateUserProfileInput,
} from '../../../lib/server/services/profile-service';

describe('profile-service', () => {
  const baseInput: UpdateUserProfileInput = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    title: 'Engineer',
    bio: 'Bio',
    website: 'https://example.com',
  };

  it('builds payload with normalized optional fields', () => {
    const payload = buildUserProfileUpdatePayload({
      name: 'Ada',
      email: 'ada@example.com',
    });

    expect(payload).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      title: '',
      bio: '',
      website: '',
    });
  });

  it('adds avatar to payload when non-empty file is provided', () => {
    const avatar = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
    const payload = buildUserProfileUpdatePayload(baseInput, avatar);

    expect(payload).toEqual(
      expect.objectContaining({
        avatar,
      })
    );
  });

  it('omits avatar when file is empty', () => {
    const avatar = new File([], 'empty.jpg', { type: 'image/jpeg' });
    const payload = buildUserProfileUpdatePayload(baseInput, avatar);

    expect(payload).not.toHaveProperty('avatar');
  });

  it('updates user, refreshes auth, and returns refreshed record', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const authRefresh = vi.fn().mockResolvedValue(undefined);
    const record = { id: 'user-123', name: 'Updated' };

    const pb = {
      collection: vi.fn(() => ({ update, authRefresh })),
      authStore: { record },
    };

    const result = await updateUserProfile(pb, 'user-123', baseInput);

    expect(update).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      })
    );
    expect(authRefresh).toHaveBeenCalledTimes(1);
    expect(result).toBe(record);
  });
});
