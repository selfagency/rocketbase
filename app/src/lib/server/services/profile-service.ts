type PocketBaseLike = {
  collection: (name: string) => {
    update: (id: string, data: Record<string, unknown>) => Promise<unknown>;
    authRefresh: () => Promise<unknown>;
  };
  authStore: {
    record: unknown;
  };
};

export type UpdateUserProfileInput = {
  name: string;
  email: string;
  title?: string;
  bio?: string;
  website?: string;
};

export function buildUserProfileUpdatePayload(
  input: UpdateUserProfileInput,
  avatarFile?: File | null
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: input.name,
    email: input.email,
    title: input.title || '',
    bio: input.bio || '',
    website: input.website || '',
  };

  if (avatarFile && avatarFile.size > 0) {
    payload.avatar = avatarFile;
  }

  return payload;
}

export async function updateUserProfile(
  pb: PocketBaseLike,
  userId: string,
  input: UpdateUserProfileInput,
  avatarFile?: File | null
): Promise<unknown> {
  const updateData = buildUserProfileUpdatePayload(input, avatarFile);

  await pb.collection('users').update(userId, updateData);
  await pb.collection('users').authRefresh();

  return pb.authStore.record;
}
