import { describe, it, expect } from 'vitest';
import { getDisplayName, getUserInitials, getPocketBaseAvatarUrl } from '../../../lib/utils/user-profile';

describe('user-profile utilities', () => {
  describe('getDisplayName', () => {
    it('returns name when available', () => {
      const user = { name: 'John Doe', email: 'john@example.com' };
      expect(getDisplayName(user)).toBe('John Doe');
    });

    it('falls back to email when name is null', () => {
      const user = { name: null, email: 'john@example.com' };
      expect(getDisplayName(user)).toBe('john@example.com');
    });

    it('falls back to email when name is undefined', () => {
      const user = { email: 'john@example.com' };
      expect(getDisplayName(user)).toBe('john@example.com');
    });

    it('falls back to email when name is empty string', () => {
      const user = { name: '', email: 'john@example.com' };
      expect(getDisplayName(user)).toBe('john@example.com');
    });

    it('returns default fallback when user is undefined', () => {
      expect(getDisplayName(undefined)).toBe('User');
    });

    it('returns default fallback when both name and email are missing', () => {
      const user = { name: null, email: null };
      expect(getDisplayName(user)).toBe('User');
    });

    it('uses custom fallback when provided', () => {
      expect(getDisplayName(undefined, 'Guest')).toBe('Guest');
    });

    it('handles user object with only name', () => {
      const user = { name: 'Alice' };
      expect(getDisplayName(user)).toBe('Alice');
    });

    it('handles user object with only email', () => {
      const user = { email: 'bob@example.com' };
      expect(getDisplayName(user)).toBe('bob@example.com');
    });
  });

  describe('getUserInitials', () => {
    it('returns first letter of first and last name for multi-word names', () => {
      const user = { name: 'John Doe' };
      expect(getUserInitials(user)).toBe('JD');
    });

    it('returns first two letters for single-word names', () => {
      const user = { name: 'John' };
      expect(getUserInitials(user)).toBe('JO');
    });

    it('handles three or more word names (first and last)', () => {
      const user = { name: 'John Michael Doe' };
      expect(getUserInitials(user)).toBe('JD');
    });

    it('falls back to email for initials when name is missing', () => {
      const user = { email: 'john@example.com' };
      expect(getUserInitials(user)).toBe('JO');
    });

    it('returns uppercase initials', () => {
      const user = { name: 'john doe' };
      expect(getUserInitials(user)).toBe('JD');
    });

    it('handles names with extra whitespace', () => {
      const user = { name: '  John   Doe  ' };
      expect(getUserInitials(user)).toBe('JD');
    });

    it('returns default fallback initial when user is undefined', () => {
      expect(getUserInitials(undefined)).toBe('US');
    });

    it('uses custom fallback for initials', () => {
      expect(getUserInitials(undefined, 'Guest User')).toBe('GU');
    });

    it('handles empty name gracefully', () => {
      const user = { name: '   ' };
      expect(getUserInitials(user)).toBe('U');
    });

    it('handles single character names', () => {
      const user = { name: 'A' };
      expect(getUserInitials(user)).toBe('A');
    });

    it('handles names with special characters', () => {
      const user = { name: 'Jean-Pierre Dubois' };
      expect(getUserInitials(user)).toBe('JD');
    });

    it('handles email-based initials', () => {
      const user = { email: 'alice.bob@example.com' };
      expect(getUserInitials(user)).toBe('AL');
    });
  });

  describe('getPocketBaseAvatarUrl', () => {
    it('generates correct avatar URL with default base URL', () => {
      const user = { id: 'user123', avatar: 'avatar.jpg' };
      const url = getPocketBaseAvatarUrl(user);
      expect(url).toBe('http://127.0.0.1:8090/api/files/_pb_users_auth_/user123/avatar.jpg');
    });

    it('generates correct avatar URL with custom base URL', () => {
      const user = { id: 'user123', avatar: 'avatar.jpg' };
      const url = getPocketBaseAvatarUrl(user, 'https://api.example.com');
      expect(url).toBe('https://api.example.com/api/files/_pb_users_auth_/user123/avatar.jpg');
    });

    it('removes trailing slash from base URL', () => {
      const user = { id: 'user123', avatar: 'avatar.jpg' };
      const url = getPocketBaseAvatarUrl(user, 'https://api.example.com/');
      expect(url).toBe('https://api.example.com/api/files/_pb_users_auth_/user123/avatar.jpg');
    });

    it('returns null when user is undefined', () => {
      expect(getPocketBaseAvatarUrl(undefined)).toBeNull();
    });

    it('returns null when user ID is missing', () => {
      const user = { avatar: 'avatar.jpg' };
      expect(getPocketBaseAvatarUrl(user)).toBeNull();
    });

    it('returns null when avatar is missing', () => {
      const user = { id: 'user123' };
      expect(getPocketBaseAvatarUrl(user)).toBeNull();
    });

    it('returns null when both id and avatar are null', () => {
      const user = { id: null, avatar: null };
      expect(getPocketBaseAvatarUrl(user)).toBeNull();
    });

    it('handles different avatar filenames', () => {
      const user = { id: 'abc', avatar: 'profile-pic_1234.png' };
      const url = getPocketBaseAvatarUrl(user);
      expect(url).toBe('http://127.0.0.1:8090/api/files/_pb_users_auth_/abc/profile-pic_1234.png');
    });

    it('works with production URLs', () => {
      const user = { id: 'user456', avatar: 'photo.webp' };
      const url = getPocketBaseAvatarUrl(user, 'https://pocketbase.example.com');
      expect(url).toBe('https://pocketbase.example.com/api/files/_pb_users_auth_/user456/photo.webp');
    });
  });
});
