#!/usr/bin/env node
/**
 * Generate 25 blog posts and a dozen tags using falso library and Pexels API for images
 *
 * This script creates realistic blog posts with:
 * - A dozen random tags
 * - Random titles using falso's randCatchPhrase
 * - Random content (3-7 paragraphs)
 * - Random summaries
 * - Random dates within the past year
 * - Random authors from existing users
 * - Random tags from existing tags (both old and newly generated)
 * - Images downloaded from Pexels curated photos
 *
 * Usage:
 *   node util/generate-posts.js
 *
 * Environment Variables (from .env file):
 *   - PEXELS_API_KEY: Required for downloading images from Pexels API
 *   - API_KEY: Used for PocketBase authentication (preferred)
 *   - API_USER: Admin username for PocketBase (fallback if no API_KEY)
 *   - API_PASS: Admin password for PocketBase (fallback if no API_KEY)
 *   - PUBLIC_POCKETBASE_URL: PocketBase server URL (default: http://127.0.0.1:8090)
 *
 * Examples:
 *   # With API_KEY from .env
 *   node util/generate-posts.js
 *
 *   # With admin credentials (fallback)
 *   API_USER=admin@example.com API_PASS=password node util/generate-posts.js
 */

import {
  randCatchPhrase,
  randJobTitle,
  randNumber,
  randParagraph,
  randPastDate,
  randProductName,
  randSentence,
  randWord,
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

type ImageFile = {
  buffer: ArrayBuffer;
  name: string;
};

type PostPayload = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  date: string;
  author: string[];
  tags: string[];
  published: boolean;
  visible: boolean;
  require_login: boolean;
  subscriber_only: boolean;
  attachments?: string[];
  imageFile?: ImageFile;
  mediaFiles?: ImageFile[];
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

function log(...args: unknown[]) {
  console.log('[generate-posts]', ...args);
}

async function adminAuth(email: string, password: string): Promise<string | null> {
  try {
    const res = asFetchResponse(
      await fetch(`${PB_URL}/api/admins/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password }),
      })
    );
    if (!res.ok) {
      log('admin auth failed', res.status);
      return null;
    }
    const data = await res.json();
    return data?.token || null;
  } catch (err) {
    log('adminAuth error', getErrorMessage(err));
    return null;
  }
}

async function fetchUsers(headers: Record<string, string>): Promise<Array<{ id: string }>> {
  const url = `${PB_URL}/api/collections/users/records?perPage=1000`;
  const res = asFetchResponse(await fetch(url, { headers }));
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
  const data = await res.json();
  return data?.items || [];
}

async function fetchTags(headers: Record<string, string>): Promise<Array<{ id: string }>> {
  const url = `${PB_URL}/api/collections/tags/records?perPage=1000`;
  const res = asFetchResponse(await fetch(url, { headers }));
  if (!res.ok) {
    log('No tags collection or failed to fetch tags');
    return [];
  }
  const data = await res.json();
  return data?.items || [];
}

async function fetchPexelsPhotos(apiKey: string, page = 1, perPage = 1): Promise<any[]> {
  const url = `https://api.pexels.com/v1/curated?per_page=${perPage}&page=${page}`;
  const res = asFetchResponse(
    await fetch(url, {
      headers: {
        Authorization: apiKey,
      },
    })
  );
  if (!res.ok) {
    log('Pexels API error:', res.status);
    return [];
  }
  const data = await res.json();
  return data.photos || [];
}

async function downloadImage(imageUrl: string): Promise<ArrayBuffer> {
  const res = asFetchResponse(await fetch(imageUrl));
  if (!res.ok) {
    throw new Error(`Failed to download image: ${res.status}`);
  }
  return res.arrayBuffer();
}

async function createMediaRecord(fileData: ImageFile, headers: Record<string, string>): Promise<{ id: string }> {
  const url = `${PB_URL}/api/collections/media/records`;
  const formData = new FormData();

  const blob = new Blob([fileData.buffer], { type: 'image/jpeg' });
  formData.append('file', blob, fileData.name);
  formData.append('source', 'Pexels');

  const { 'Content-Type': _, ...headersWithoutContentType } = headers;

  const res = asFetchResponse(
    await fetch(url, {
      method: 'POST',
      headers: headersWithoutContentType,
      body: formData,
    })
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create media record: ${res.status} ${error}`);
  }

  return res.json();
}

async function createPost(
  postData: PostPayload,
  headers: Record<string, string>
): Promise<{ id: string; title: string }> {
  const url = `${PB_URL}/api/collections/posts/records`;

  // Convert uploaded media files to media records, then attach relation IDs to the post
  if (postData.mediaFiles && postData.mediaFiles.length > 0) {
    const attachmentIds = [...(postData.attachments || [])];

    for (const mediaFile of postData.mediaFiles) {
      const mediaRecord = await createMediaRecord(mediaFile, headers);
      attachmentIds.push(mediaRecord.id);
    }

    postData.attachments = attachmentIds;
  }

  // Check if we have any files (image or media)
  const hasFiles = postData.imageFile;

  if (hasFiles) {
    const formData = new FormData();

    // Add all post fields except file objects
    for (const [key, value] of Object.entries(postData)) {
      if (key === 'imageFile' || key === 'mediaFiles') continue;

      if (Array.isArray(value)) {
        // For array fields like author and tags, append each value
        for (const item of value) {
          formData.append(key, String(item));
        }
      } else {
        formData.append(key, String(value));
      }
    }

    // Add the featured image file
    if (postData.imageFile) {
      const blob = new Blob([postData.imageFile.buffer], { type: 'image/jpeg' });
      formData.append('image', blob, postData.imageFile.name);
    }

    // Remove Content-Type header to let fetch set it with boundary
    const { 'Content-Type': _, ...headersWithoutContentType } = headers;

    const res = asFetchResponse(
      await fetch(url, {
        method: 'POST',
        headers: headersWithoutContentType,
        body: formData,
      })
    );

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to create post (FormData): ${res.status} ${error}`);
    }
    return res.json();
  }

  // Fallback to JSON request if no images
  const res = asFetchResponse(
    await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(postData),
    })
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create post (JSON): ${res.status} ${error}`);
  }
  return res.json();
}

async function createTag(
  tagData: { tag: string; slug: string },
  headers: Record<string, string>
): Promise<{ id: string; tag: string }> {
  const url = `${PB_URL}/api/collections/tags/records`;
  const res = asFetchResponse(
    await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(tagData),
    })
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create tag: ${res.status} ${error}`);
  }
  return res.json();
}

async function generatePost(
  users: Array<{ id: string }>,
  tags: Array<{ id: string }>,
  pexelsPage: number
): Promise<PostPayload> {
  // Mixed titles for more variety
  const title = randNumber({ min: 0, max: 1 }) === 0 ? randCatchPhrase() : `${randJobTitle()} ${randProductName()}`;

  // Add random number to slug to prevent duplicates
  const slug = dash(title) + '-' + randNumber({ min: 1000, max: 9999 });
  const summary = randSentence();

  // Generate 4-10 paragraphs for content
  const paragraphCount = randNumber({ min: 4, max: 10 });
  const paragraphs = randParagraph({ length: paragraphCount });
  const content = `<p>${paragraphs.join('</p><p>')}</p>`;

  // Random date within the last year
  const date = randPastDate({ years: 1 }).toISOString();

  // Pick 1-3 random authors
  const authorCount = randNumber({ min: 1, max: Math.min(3, users.length) });
  const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
  const author = shuffledUsers.slice(0, authorCount).map((u: { id: string }) => u.id);

  // Pick 1-5 random tags (if tags exist)
  let postTags: string[] = [];
  if (tags.length > 0) {
    const tagCount = randNumber({ min: 1, max: Math.min(5, tags.length) });
    const shuffledTags = [...tags].sort(() => Math.random() - 0.5);
    postTags = shuffledTags.slice(0, tagCount).map((t: { id: string }) => t.id);
  }

  const postData: PostPayload = {
    title,
    slug,
    summary,
    content,
    date,
    author,
    tags: postTags,
    published: true,
    visible: true,
    require_login: false,
    subscriber_only: false,
  };

  // Fetch and download Pexels images if API key is available
  if (PEXELS_API_KEY) {
    try {
      // Fetch up to 4 photos (1 for image, 0-3 for media)
      const photoCount = randNumber({ min: 1, max: 4 });
      const photos = await fetchPexelsPhotos(PEXELS_API_KEY, pexelsPage, photoCount);

      if (photos.length > 0) {
        // First photo for 'image' field
        const mainPhoto = photos[0];
        const mainBuffer = await downloadImage(mainPhoto.src.large);
        postData.imageFile = {
          buffer: mainBuffer,
          name: `${slug}.jpg`,
        };
        log(`  Downloaded main image (photographer: ${mainPhoto.photographer})`);

        // Remaining photos become media records attached via relation IDs
        if (photos.length > 1) {
          postData.mediaFiles = [];
          for (let i = 1; i < photos.length; i++) {
            const mediaPhoto = photos[i];
            const mediaBuffer = await downloadImage(mediaPhoto.src.large);
            postData.mediaFiles.push({
              buffer: mediaBuffer,
              name: `${slug}-media-${i}.jpg`,
            });
          }
          log(`  Downloaded ${postData.mediaFiles.length} attachment images`);
        }
      }
    } catch (err) {
      log(`  Failed to fetch Pexels images:`, getErrorMessage(err));
      // Continue without image
    }
  }

  return postData;
}

void (async function main() {
  log('Starting blog post generation (POCKETBASE_URL=', PB_URL, ')');

  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Use API_KEY from env if available, otherwise authenticate as admin
  const API_KEY = process.env.API_KEY;
  if (API_KEY) {
    log('Using API_KEY from environment');
    headers.Authorization = `Bearer ${API_KEY}`;
  } else {
    log('No API_KEY found, authenticating as admin');
    const token = await adminAuth(API_USER, API_PASS);
    if (!token) {
      log('Failed to authenticate. Exiting.');
      process.exitCode = 1;
      return;
    }
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    // Fetch existing users and tags
    const users = await fetchUsers(headers);
    const tags = await fetchTags(headers);

    log('Found', users.length, 'users and', tags.length, 'tags');

    if (users.length === 0) {
      log('No users found. Cannot generate posts without authors.');
      process.exitCode = 1;
      return;
    }

    // Generate 12 tags
    const tagCountToGenerate = 12;
    log(`Generating ${tagCountToGenerate} tags...`);
    for (let i = 0; i < tagCountToGenerate; i++) {
      const word = randWord();
      const tag = word.charAt(0).toUpperCase() + word.slice(1);
      const slug = dash(tag) + '-' + randNumber({ min: 100, max: 999 });
      try {
        const newTag = await createTag({ tag, slug }, headers);
        log(`Created tag ${i + 1}/${tagCountToGenerate}: "${newTag.tag}" (${newTag.id})`);
        tags.push(newTag);
      } catch (err) {
        log(`Failed to create tag ${i + 1}:`, getErrorMessage(err));
      }
    }

    // Generate and create 25 posts
    const postCount = 25;
    log(`Generating ${postCount} blog posts...`);
    if (!PEXELS_API_KEY) {
      log('Warning: PEXELS_API_KEY not set. Posts will be created without images.');
    }

    for (let i = 0; i < postCount; i++) {
      // Use a different Pexels page for each post to get variety
      const pexelsPage = i + 1;
      const postData = await generatePost(users, tags, pexelsPage);
      try {
        const post = await createPost(postData, headers);
        log(`Created post ${i + 1}/${postCount}: "${post.title}" (${post.id})`);
      } catch (err) {
        log(`Failed to create post ${i + 1}:`, getErrorMessage(err));
        // Continue with next post
      }
    }

    log('Blog post generation complete');
  } catch (err) {
    log('Generation failed:', getErrorMessage(err));
    process.exitCode = 2;
  }
})();
