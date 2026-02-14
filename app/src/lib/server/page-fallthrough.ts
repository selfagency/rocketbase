export const RESERVED_ROUTE_SEGMENTS = [
	'account',
	'auth',
	'forgot-password',
	'login',
	'logout',
	'register',
	'verify-email'
] as const;

export const RESERVED_ROUTES = new Set<string>(RESERVED_ROUTE_SEGMENTS);

export const FALLTHROUGH_PAGE_FIELDS =
	'id,title,slug,content,summary,image,media,custom_css,created,updated,require_login,subscriber_only';

type FallthroughPage = {
	require_login?: boolean;
	subscriber_only?: boolean;
};

type AccessErrorKey = 'error.authentication_required' | 'error.subscriber_access_required';

export function isReservedFallthroughSlug(slug: string) {
	const firstSegment = slug.split('/')[0];
	return RESERVED_ROUTES.has(firstSegment);
}

export function getFallthroughAccessError(
	page: FallthroughPage,
	isAuthenticated: boolean
): AccessErrorKey | null {
	if (page.require_login && !isAuthenticated) {
		return 'error.authentication_required';
	}

	if (page.subscriber_only && !isAuthenticated) {
		return 'error.subscriber_access_required';
	}

	return null;
}
