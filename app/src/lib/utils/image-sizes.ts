export type StandardImageSizeKey = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type SocialImageSizeKey = 'facebook' | 'twitter' | 'linkedin' | 'instagram';

export type ImageSizePreset = {
  key: StandardImageSizeKey;
  label: string;
  thumb: string | null;
};

export type SocialImagePreset = {
  key: SocialImageSizeKey;
  label: string;
  thumb: string;
  width: number;
  height: number;
};

export const STANDARD_IMAGE_SIZE_PRESETS: ImageSizePreset[] = [
  { key: 'sm', label: 'Small (sm)', thumb: '480x0' },
  { key: 'md', label: 'Medium (md)', thumb: '768x0' },
  { key: 'lg', label: 'Large (lg)', thumb: '1200x0' },
  { key: 'xl', label: 'Extra Large (xl)', thumb: '1600x0' },
  { key: 'full', label: 'Full-size', thumb: null },
];

export const SOCIAL_IMAGE_PRESETS: SocialImagePreset[] = [
  { key: 'facebook', label: 'Facebook', thumb: '1200x630f', width: 1200, height: 630 },
  { key: 'twitter', label: 'X/Twitter', thumb: '1200x675f', width: 1200, height: 675 },
  { key: 'linkedin', label: 'LinkedIn', thumb: '1200x627f', width: 1200, height: 627 },
  { key: 'instagram', label: 'Instagram', thumb: '1080x1080f', width: 1080, height: 1080 },
];

export function appendThumb(url: string, thumb: string | null | undefined): string {
  if (!thumb) return url;
  const join = url.includes('?') ? '&' : '?';
  return `${url}${join}thumb=${encodeURIComponent(thumb)}`;
}

export function getStandardImageUrl(url: string, size: StandardImageSizeKey): string {
  const preset = STANDARD_IMAGE_SIZE_PRESETS.find(entry => entry.key === size);
  return appendThumb(url, preset?.thumb ?? null);
}

export function getSocialImageUrl(url: string, network: SocialImageSizeKey): string {
  const preset = SOCIAL_IMAGE_PRESETS.find(entry => entry.key === network);
  return appendThumb(url, preset?.thumb ?? null);
}
