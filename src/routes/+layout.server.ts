import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	locals.log.info('Layout server load called');
	return {};
};
