import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * Generate a PocketBase file URL
 * Format: /api/files/COLLECTION_NAME/RECORD_ID/FILENAME
 *
 * @param collection - Collection name (e.g., 'posts', 'users')
 * @param recordId - Record ID
 * @param filename - File name
 * @param cdnUrl - Optional CDN URL to prepend (from metadata)
 * @returns Complete file URL
 */
export function getFileUrl(
	collection: string,
	recordId: string,
	filename: string,
	cdnUrl?: string
): string {
	const path = `/api/files/${collection}/${recordId}/${filename}`;
	return cdnUrl ? `${cdnUrl}${path}` : path;
}
