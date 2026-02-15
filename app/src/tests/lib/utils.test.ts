import { cn, getFileUrl } from '$lib/utils';
import { describe, expect, it } from 'vitest';

describe('utils', () => {
  it('cn merges and dedups class names', () => {
    const res = cn('p-2', 'text-sm', 'p-2', { 'text-bold': false } as any);
    expect(typeof res).toBe('string');
    expect(res).toContain('p-2');
    expect(res).toContain('text-sm');
  });

  it('getFileUrl builds path without CDN', () => {
    const url = getFileUrl('posts', 'rec1', 'image.png');
    expect(url).toBe('/api/files/posts/rec1/image.png');
  });

  it('getFileUrl prepends CDN when provided', () => {
    const url = getFileUrl('users', 'u1', 'a.jpg', 'https://cdn.test');
    expect(url).toBe('https://cdn.test/api/files/users/u1/a.jpg');
  });

  it('getFileUrl encodes filenames for media library uploads', () => {
    const url = getFileUrl('media', 'abc123', 'hero image (1).png');
    expect(url).toBe('/api/files/media/abc123/hero%20image%20(1).png');
  });
});

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles conditional classes', () => {
      const showBar = false;
      expect(cn('foo', showBar && 'bar', 'baz')).toBe('foo baz');
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

    it('encodes spaces in filenames', () => {
      const url = getFileUrl('media', 'id789', 'sample file.jpg');
      expect(url).toBe('/api/files/media/id789/sample%20file.jpg');
    });
  });
});
