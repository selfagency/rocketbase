type DisplayUser = {
  name?: string | null;
  email?: string | null;
};

type AvatarUser = {
  id?: string | null;
  avatar?: string | null;
};

export function getDisplayName(user?: DisplayUser, fallback = 'User') {
  return user?.name || user?.email || fallback;
}

export function getUserInitials(user?: DisplayUser, fallback = 'User') {
  const display = getDisplayName(user, fallback).trim();
  const parts = display.split(/\s+/).filter(Boolean);

  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getPocketBaseAvatarUrl(user?: AvatarUser, baseUrl = 'http://127.0.0.1:8090') {
  if (!user?.id || !user.avatar) return null;
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  return `${normalizedBaseUrl}/api/files/_pb_users_auth_/${user.id}/${user.avatar}`;
}
