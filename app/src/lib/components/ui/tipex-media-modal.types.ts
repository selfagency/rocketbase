export type EntityType = 'post' | 'page';

export type TipexMediaItem = {
  id: string;
  url: string;
  altText: string;
  caption: string;
  source: string;
  sourceUrl: string;
  created: string;
  updated: string;
  attribution?: {
    photographer?: string;
    photographerUrl?: string;
    photoUrl?: string;
    provider?: string;
  };
};

export type PexelsPhoto = {
  id: number;
  alt: string;
  width: number;
  height: number;
  src: {
    tiny: string;
    medium: string;
    large: string;
    original: string;
  };
  photoUrl: string;
  photographer: string;
  photographerUrl: string;
};
