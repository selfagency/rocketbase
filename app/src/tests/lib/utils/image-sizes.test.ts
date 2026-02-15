import { describe, expect, it } from 'vitest';
import {
  appendThumb,
  getSocialImageUrl,
  getStandardImageUrl,
  SOCIAL_IMAGE_PRESETS,
  STANDARD_IMAGE_SIZE_PRESETS,
} from '../../../lib/utils/image-sizes';

describe('image-sizes utilities', () => {
  it('appendThumb appends thumb query when provided', () => {
    expect(appendThumb('https://cdn/image.jpg', '1200x630f')).toBe('https://cdn/image.jpg?thumb=1200x630f');
  });

  it('appendThumb returns original url when thumb is null', () => {
    expect(appendThumb('https://cdn/image.jpg', null)).toBe('https://cdn/image.jpg');
  });

  it('appendThumb appends with ampersand when query already exists', () => {
    expect(appendThumb('https://cdn/image.jpg?token=1', '480x0')).toBe('https://cdn/image.jpg?token=1&thumb=480x0');
  });

  it('getStandardImageUrl resolves each preset key', () => {
    expect(getStandardImageUrl('https://cdn/image.jpg', 'sm')).toContain('thumb=480x0');
    expect(getStandardImageUrl('https://cdn/image.jpg', 'md')).toContain('thumb=768x0');
    expect(getStandardImageUrl('https://cdn/image.jpg', 'lg')).toContain('thumb=1200x0');
    expect(getStandardImageUrl('https://cdn/image.jpg', 'xl')).toContain('thumb=1600x0');
    expect(getStandardImageUrl('https://cdn/image.jpg', 'full')).toBe('https://cdn/image.jpg');
  });

  it('getSocialImageUrl resolves each social network key', () => {
    expect(getSocialImageUrl('https://cdn/image.jpg', 'facebook')).toContain('thumb=1200x630f');
    expect(getSocialImageUrl('https://cdn/image.jpg', 'twitter')).toContain('thumb=1200x675f');
    expect(getSocialImageUrl('https://cdn/image.jpg', 'linkedin')).toContain('thumb=1200x627f');
    expect(getSocialImageUrl('https://cdn/image.jpg', 'instagram')).toContain('thumb=1080x1080f');
  });

  it('exposes expected standard presets', () => {
    expect(STANDARD_IMAGE_SIZE_PRESETS).toEqual([
      { key: 'sm', label: 'Small (sm)', thumb: '480x0' },
      { key: 'md', label: 'Medium (md)', thumb: '768x0' },
      { key: 'lg', label: 'Large (lg)', thumb: '1200x0' },
      { key: 'xl', label: 'Extra Large (xl)', thumb: '1600x0' },
      { key: 'full', label: 'Full-size', thumb: null },
    ]);
  });

  it('exposes expected social presets', () => {
    expect(SOCIAL_IMAGE_PRESETS).toEqual([
      { key: 'facebook', label: 'Facebook', thumb: '1200x630f', width: 1200, height: 630 },
      { key: 'twitter', label: 'X/Twitter', thumb: '1200x675f', width: 1200, height: 675 },
      { key: 'linkedin', label: 'LinkedIn', thumb: '1200x627f', width: 1200, height: 627 },
      { key: 'instagram', label: 'Instagram', thumb: '1080x1080f', width: 1080, height: 1080 },
    ]);
  });
});
