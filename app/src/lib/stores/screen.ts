import { writable } from 'svelte/store';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1280;

export const isMobile = writable(false);
export const isTablet = writable(false);
export const isDesktop = writable(false);
export const screenWidth = writable(0);
export const screenHeight = writable(0);

export function setScreenSize(width: number, height: number) {
	screenWidth.set(width);
	screenHeight.set(height);
	isMobile.set(width < MOBILE_BREAKPOINT);
	isTablet.set(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT);
	isDesktop.set(width >= TABLET_BREAKPOINT);
}
