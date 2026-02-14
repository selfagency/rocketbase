#!/usr/bin/env node
/**
 * Generate 25 blog posts using falso library and Pexels API for images
 *
 * This script creates realistic blog posts with:
 * - Random titles using falso's randCatchPhrase
 * - Random content (3-7 paragraphs)
 * - Random summaries
 * - Random dates within the past year
 * - Random authors from existing users
 * - Random tags from existing tags (if any)
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

import 'dotenv/config';
import {
	randCatchPhrase,
	randParagraph,
	randSentence,
	randPastDate,
	randNumber
} from '@ngneat/falso';

const PB_URL =
	process.env.PUBLIC_POCKETBASE_URL || process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const API_USER = process.env.API_USER || 'admin@example.com';
const API_PASS = process.env.API_PASS || 'test1234567890';
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';

function log(...args) {
	console.log('[generate-posts]', ...args);
}

async function adminAuth(email, password) {
	try {
		const res = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ identity: email, password })
		});
		if (!res.ok) {
			log('admin auth failed', res.status);
			return null;
		}
		const data = await res.json();
		return data?.token || null;
	} catch (err) {
		log('adminAuth error', err.message || err);
		return null;
	}
}

async function fetchUsers(headers) {
	const url = `${PB_URL}/api/collections/users/records?perPage=1000`;
	const res = await fetch(url, { headers });
	if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
	const data = await res.json();
	return data?.items || [];
}

async function fetchTags(headers) {
	const url = `${PB_URL}/api/collections/tags/records?perPage=1000`;
	const res = await fetch(url, { headers });
	if (!res.ok) {
		log('No tags collection or failed to fetch tags');
		return [];
	}
	const data = await res.json();
	return data?.items || [];
}

async function fetchPexelsPhoto(apiKey, page = 1) {
	const url = `https://api.pexels.com/v1/curated?per_page=1&page=${page}`;
	const res = await fetch(url, {
		headers: {
			Authorization: apiKey
		}
	});
	if (!res.ok) {
		log('Pexels API error:', res.status);
		return null;
	}
	const data = await res.json();
	return data.photos?.[0] || null;
}

async function downloadImage(imageUrl) {
	const res = await fetch(imageUrl);
	if (!res.ok) {
		throw new Error(`Failed to download image: ${res.status}`);
	}
	return res.arrayBuffer();
}

async function createPost(postData, headers) {
	const url = `${PB_URL}/api/collections/posts/records`;

	// If we have image data, create a FormData request
	if (postData.imageBuffer && postData.imageFilename) {
		const formData = new FormData();

		// Add all post fields except image data
		for (const [key, value] of Object.entries(postData)) {
			if (key === 'imageBuffer' || key === 'imageFilename') continue;

			if (Array.isArray(value)) {
				// For array fields like author and tags, append each value
				for (const item of value) {
					formData.append(key, item);
				}
			} else {
				formData.append(key, value);
			}
		}

		// Add the image file
		const blob = new Blob([postData.imageBuffer], { type: 'image/jpeg' });
		formData.append('image', blob, postData.imageFilename);

		// Remove Content-Type header to let fetch set it with boundary
		const { 'Content-Type': _, ...headersWithoutContentType } = headers;

		const res = await fetch(url, {
			method: 'POST',
			headers: headersWithoutContentType,
			body: formData
		});

		if (!res.ok) {
			const error = await res.text();
			throw new Error(`Failed to create post: ${res.status} ${error}`);
		}
		return res.json();
	}

	// Fallback to JSON request if no image
	const res = await fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify(postData)
	});
	if (!res.ok) {
		const error = await res.text();
		throw new Error(`Failed to create post: ${res.status} ${error}`);
	}
	return res.json();
}

function slugify(text) {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();
}

async function generatePost(users, tags, pexelsPage) {
	const title = randCatchPhrase();
	// Add random number to slug to prevent duplicates
	const slug = slugify(title) + '-' + randNumber({ min: 1000, max: 9999 });
	const summary = randSentence();

	// Generate 3-7 paragraphs for content
	const paragraphCount = randNumber({ min: 3, max: 7 });
	const paragraphs = randParagraph({ length: paragraphCount });
	const content = `<p>${paragraphs.join('</p><p>')}</p>`;

	// Random date within the last year
	const date = randPastDate({ years: 1 }).toISOString();

	// Pick 1-3 random authors
	const authorCount = randNumber({ min: 1, max: Math.min(3, users.length) });
	const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
	const author = shuffledUsers.slice(0, authorCount).map((u) => u.id);

	// Pick 1-5 random tags (if tags exist)
	let postTags = [];
	if (tags.length > 0) {
		const tagCount = randNumber({ min: 1, max: Math.min(5, tags.length) });
		const shuffledTags = [...tags].sort(() => Math.random() - 0.5);
		postTags = shuffledTags.slice(0, tagCount).map((t) => t.id);
	}

	const postData = {
		title,
		slug,
		summary,
		content,
		date,
		author,
		tags: postTags,
		published: true,
		require_login: false,
		subscriber_only: false
	};

	// Fetch and download Pexels image if API key is available
	if (PEXELS_API_KEY) {
		try {
			const photo = await fetchPexelsPhoto(PEXELS_API_KEY, pexelsPage);
			if (photo?.src?.large) {
				const imageBuffer = await downloadImage(photo.src.large);
				postData.imageBuffer = imageBuffer;
				postData.imageFilename = `${slug}.jpg`;
				log(`  Downloaded image from Pexels (photographer: ${photo.photographer})`);
			}
		} catch (err) {
			log(`  Failed to fetch Pexels image:`, err.message);
			// Continue without image
		}
	}

	return postData;
}

void (async function main() {
	log('Starting blog post generation (POCKETBASE_URL=', PB_URL, ')');

	let headers = {
		'Content-Type': 'application/json'
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
				log(`Failed to create post ${i + 1}:`, err.message);
				// Continue with next post
			}
		}

		log('Blog post generation complete');
	} catch (err) {
		log('Generation failed:', err.message || err);
		process.exitCode = 2;
	}
})();
