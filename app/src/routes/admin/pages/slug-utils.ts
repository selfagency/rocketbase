import { removeStopwords } from 'stopword';
import { snake } from 'radashi';

/**
 * Generate a URL-friendly slug from a title
 * - Removes stop words
 * - Converts to lowercase
 * - Replaces special characters with letters or removes them
 * - Hyphenates spaces
 */
export function generateSlug(title: string): string {
	if (!title) return '';

	// Split into words
	const words = title
		.toLowerCase()
		// Normalize special characters (é -> e, ñ -> n, etc.)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		// Remove or replace special characters
		.replace(/[^\w\s-]/g, '')
		// Split into words
		.split(/\s+/)
		.filter(Boolean);

	// Remove stop words
	const wordsWithoutStopwords = removeStopwords(words);

	// If all words were stop words, keep the original words
	const finalWords = wordsWithoutStopwords.length > 0 ? wordsWithoutStopwords : words;

	// Join with snake case (hyphenated)
	const slug = snake(finalWords.join(' '));

	return slug;
}
