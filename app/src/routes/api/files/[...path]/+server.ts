import type { RequestHandler } from './$types';

const POCKETBASE_URL = 'http://127.0.0.1:8090';

export const GET: RequestHandler = async ({ params, request }) => {
	const url = `${POCKETBASE_URL}/api/files/${params.path}`;

	// Forward the request to PocketBase
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			// Forward relevant headers
			'User-Agent': request.headers.get('User-Agent') || '',
			Accept: request.headers.get('Accept') || '*/*'
		}
	});

	// Return the file response
	return new Response(response.body, {
		status: response.status,
		headers: {
			'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
			'Cache-Control': response.headers.get('Cache-Control') || 'public, max-age=31536000',
			'Content-Length': response.headers.get('Content-Length') || '0'
		}
	});
};
