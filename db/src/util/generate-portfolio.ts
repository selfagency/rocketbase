#!/usr/bin/env node
/**
 * Generate fake portfolio records and optional media using Falso + Pexels.
 *
 * Usage:
 *   node util/generate-portfolio.js
 */

import {
  randCompanyName,
  randNumber,
  randParagraph,
  randProduct,
  randProductCategory,
  randSentence,
  randUrl,
} from '@ngneat/falso';
import 'dotenv/config';
import { dash } from 'radashi';

const PB_URL = process.env.PUBLIC_POCKETBASE_URL || process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const API_USER = process.env.API_USER || 'admin@example.com';
const API_PASS = process.env.API_PASS || 'test1234567890';
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';

type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
  text: () => Promise<string>;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

type MediaFile = {
  buffer: ArrayBuffer | Buffer;
  name: string;
  mimeType?: string;
  source?: string;
  sourceUrl?: string;
};

type PortfolioItem = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  url: string;
  published: boolean;
  visible: boolean;
  imageFile?: MediaFile;
  mediaFiles?: MediaFile[];
};

function asFetchResponse(response: unknown): FetchResponse {
  return response as FetchResponse;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }

  return String(err);
}

function toBlobPart(data: ArrayBuffer | Buffer): any {
  if (data instanceof ArrayBuffer) {
    return data;
  }

  return new Uint8Array(data);
}

function log(...args: unknown[]) {
  console.log('[generate-portfolio]', ...args);
}

async function adminAuth(email: string, password: string): Promise<string | null> {
  const res = asFetchResponse(await fetch(`${PB_URL}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password }),
  }));

  if (!res.ok) return null;
  const data = await res.json();
  return data?.token || null;
}

async function fetchPexelsPhotos(apiKey: string, page = 1, perPage = 1): Promise<any[]> {
  const url = `https://api.pexels.com/v1/curated?per_page=${perPage}&page=${page}`;
  const res = asFetchResponse(await fetch(url, {
    headers: {
      Authorization: apiKey,
    },
  }));

  if (!res.ok) return [];
  const data = await res.json();
  return data.photos || [];
}

async function downloadImage(imageUrl: string): Promise<ArrayBuffer> {
  const res = asFetchResponse(await fetch(imageUrl));
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
  return res.arrayBuffer();
}

async function createMediaRecord(fileData: MediaFile, headers: Record<string, string>): Promise<{ id: string }> {
  const url = `${PB_URL}/api/collections/media/records`;
  const formData = new FormData();

  const blob = new Blob([toBlobPart(fileData.buffer)], { type: fileData.mimeType || 'image/jpeg' });
  formData.append('file', blob, fileData.name);
  formData.append('source', fileData.source || 'Generator');
  if (fileData.sourceUrl) {
    formData.append('source_url', fileData.sourceUrl);
  }

  const { 'Content-Type': _, ...headersWithoutContentType } = headers;

  const res = asFetchResponse(await fetch(url, {
    method: 'POST',
    headers: headersWithoutContentType,
    body: formData,
  }));

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create media record: ${res.status} ${error}`);
  }

  return res.json();
}

async function createPortfolioRecord(
  itemData: PortfolioItem & { mediaIds?: string[] },
  headers: Record<string, string>,
): Promise<{ id: string; title: string }> {
  const url = `${PB_URL}/api/collections/portfolio/records`;
  const formData = new FormData();

  formData.append('title', itemData.title);
  formData.append('slug', itemData.slug);
  formData.append('summary', itemData.summary);
  formData.append('description', itemData.description);
  formData.append('url', itemData.url);
  formData.append('published', String(itemData.published));
  formData.append('visible', String(itemData.visible));

  if (itemData.imageFile) {
    const imageBlob = new Blob([toBlobPart(itemData.imageFile.buffer)], { type: 'image/jpeg' });
    formData.append('image', imageBlob, itemData.imageFile.name);
  }

  if (Array.isArray(itemData.mediaIds)) {
    for (const mediaId of itemData.mediaIds) {
      formData.append('media', mediaId);
    }
  }

  const { 'Content-Type': _, ...headersWithoutContentType } = headers;
  const res = asFetchResponse(await fetch(url, {
    method: 'POST',
    headers: headersWithoutContentType,
    body: formData,
  }));

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create portfolio record: ${res.status} ${error}`);
  }

  return res.json();
}

async function generatePortfolioItem(index: number): Promise<PortfolioItem> {
  const product = randProduct();
  const company = randCompanyName();
  const category = randProductCategory();
  const productTitle =
    product && typeof product === 'object' && 'title' in product && typeof product.title === 'string'
      ? product.title
      : String(product);

  const title = `${company} ${productTitle}`;
  const slug = `${dash(title)}-${randNumber({ min: 1000, max: 9999 })}`;
  const summary = randSentence();
  const paragraphs = randParagraph({ length: randNumber({ min: 2, max: 5 }) });

  const description = `<p>${paragraphs.join('</p><p>')}</p>`;
  const url = randUrl();

  const item: PortfolioItem = {
    title,
    slug,
    summary: `${summary} (${category})`,
    description,
    url,
    published: true,
    visible: true,
  };

  function createSyntheticSvgAsset(kind: string, sequence: number): MediaFile {
    const width = 1600;
    const height = 900;
    const hue = (index * 37 + sequence * 71) % 360;
    const bg = `hsl(${hue} 65% 45%)`;
    const fg = 'rgba(255,255,255,0.92)';
    const subtitle = kind === 'cover' ? 'Cover image' : `Media ${sequence}`;
    const text = `${title} — ${subtitle}`
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bg}" />
  <g fill="${fg}" font-family="Inter, system-ui, sans-serif">
    <text x="80" y="430" font-size="64" font-weight="700">${text}</text>
    <text x="80" y="500" font-size="36" opacity="0.9">Generated portfolio seed asset</text>
  </g>
</svg>`;

    return {
      buffer: Buffer.from(svg, 'utf-8'),
      name: `${slug}-${kind}${sequence ? `-${sequence}` : ''}.svg`,
      mimeType: 'image/svg+xml',
      source: 'Generator',
    };
  }

  if (!PEXELS_API_KEY) {
    item.imageFile = createSyntheticSvgAsset('cover', 0);
    item.mediaFiles = [createSyntheticSvgAsset('media', 1), createSyntheticSvgAsset('media', 2)];
    return item;
  }

  const photos = await fetchPexelsPhotos(PEXELS_API_KEY, index + 1, 4);
  if (photos.length === 0) {
    item.imageFile = createSyntheticSvgAsset('cover', 0);
    item.mediaFiles = [createSyntheticSvgAsset('media', 1), createSyntheticSvgAsset('media', 2)];
    return item;
  }

  const main = photos[0];
  item.imageFile = {
    buffer: await downloadImage(main.src.large),
    name: `${slug}-cover.jpg`,
    mimeType: 'image/jpeg',
    source: 'Pexels',
    sourceUrl: main.url,
  };

  item.mediaFiles = [];
  for (let i = 1; i < photos.length; i++) {
    const photo = photos[i];
    item.mediaFiles.push({
      buffer: await downloadImage(photo.src.large),
      name: `${slug}-media-${i}.jpg`,
      mimeType: 'image/jpeg',
      source: 'Pexels',
      sourceUrl: photo.url,
    });
  }

  if (item.mediaFiles.length === 0) {
    item.mediaFiles.push(createSyntheticSvgAsset('media', 1));
  }

  return item;
}

void (async function main() {
  log('Starting portfolio generation');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const apiKey = process.env.API_KEY;
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  } else {
    const token = await adminAuth(API_USER, API_PASS);
    if (!token) {
      log('Failed to authenticate. Set API_KEY or API_USER/API_PASS.');
      process.exitCode = 1;
      return;
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const total = 20;
  for (let i = 0; i < total; i++) {
    try {
      const item = await generatePortfolioItem(i);

      const mediaIds: string[] = [];
      if (Array.isArray(item.mediaFiles) && item.mediaFiles.length > 0) {
        for (const mediaFile of item.mediaFiles) {
          const mediaRecord = await createMediaRecord(mediaFile, headers);
          mediaIds.push(mediaRecord.id);
        }
      }

      const created = await createPortfolioRecord({ ...item, mediaIds }, headers);
      log(`Created ${i + 1}/${total}: ${created.title} (${created.id})`);
    } catch (err) {
      log(`Failed item ${i + 1}:`, getErrorMessage(err));
    }
  }

  log('Portfolio generation complete');
})();
