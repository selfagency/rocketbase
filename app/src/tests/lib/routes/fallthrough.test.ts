import { describe, expect, it } from 'vitest';
import { constructFullPath, findPageBySlug } from '$lib/routes/fallthrough';
import type { PageItem } from '$lib/routes/nav';

const navItems: PageItem[] = [
	{
		id: 'home',
		slug: 'home',
		title: 'Home'
	},
	{
		id: 'about',
		slug: 'about',
		title: 'About',
		children: [
			{
				id: 'team',
				slug: 'team',
				title: 'Team',
				parent: 'about'
			},
			{
				id: 'history',
				slug: 'history',
				title: 'History',
				parent: 'about',
				children: [
					{
						id: 'founders',
						slug: 'founders',
						title: 'Founders',
						parent: 'history'
					}
				]
			}
		]
	}
];

describe('fallthrough route helpers', () => {
	describe('findPageBySlug', () => {
		it('returns a top-level page for an exact slug', () => {
			const page = findPageBySlug(navItems, 'about');
			expect(page?.id).toBe('about');
		});

		it('returns nested pages when their slug matches directly', () => {
			const page = findPageBySlug(navItems, 'team');
			expect(page?.id).toBe('team');
		});

		it('resolves two-segment hierarchical slugs', () => {
			const page = findPageBySlug(navItems, 'about/team');
			expect(page?.id).toBe('team');
		});

		it('returns null for unknown slugs', () => {
			const page = findPageBySlug(navItems, 'missing-page');
			expect(page).toBeNull();
		});
	});

	describe('constructFullPath', () => {
		it('builds full paths by traversing parent links', () => {
			const team = navItems[1].children?.find((page) => page.id === 'team');
			expect(team).toBeDefined();
			expect(constructFullPath(team!, navItems)).toBe('/about/team');
		});

		it('handles deeper nesting', () => {
			const founders = navItems[1].children
				?.find((page) => page.id === 'history')
				?.children?.find((page) => page.id === 'founders');
			expect(founders).toBeDefined();
			expect(constructFullPath(founders!, navItems)).toBe('/about/history/founders');
		});
	});
});
