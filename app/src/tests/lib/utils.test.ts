import { describe, it, expect } from 'vitest';
import { cn, getFileUrl } from '../../lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('merges tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });
  });

  describe('getFileUrl', () => {
    it('generates file URL without CDN', () => {
      const url = getFileUrl('posts', 'record123', 'image.jpg');
      expect(url).toBe('/api/files/posts/record123/image.jpg');
    });

    it('generates file URL with CDN', () => {
      const url = getFileUrl('posts', 'record123', 'image.jpg', 'https://cdn.example.com');
      expect(url).toBe('https://cdn.example.com/api/files/posts/record123/image.jpg');
    });

    it('handles different collection names', () => {
      const url = getFileUrl('users', 'user456', 'avatar.png');
      expect(url).toBe('/api/files/users/user456/avatar.png');
    });

    it('handles CDN URL without trailing slash', () => {
      const url = getFileUrl('media', 'id789', 'video.mp4', 'https://cdn.example.com');
      expect(url).toBe('https://cdn.example.com/api/files/media/id789/video.mp4');
    });

    it('handles CDN URL with trailing slash', () => {
      const url = getFileUrl('media', 'id789', 'video.mp4', 'https://cdn.example.com/');
      expect(url).toBe('https://cdn.example.com//api/files/media/id789/video.mp4');
    });
  });
});
