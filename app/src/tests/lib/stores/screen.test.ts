import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import {
  isMobile,
  isTablet,
  isDesktop,
  screenWidth,
  screenHeight,
  setScreenSize,
} from '../../../lib/stores/screen';

describe('screen store', () => {
  describe('setScreenSize', () => {
    it('sets mobile breakpoint correctly', () => {
      setScreenSize(375, 667);

      expect(get(screenWidth)).toBe(375);
      expect(get(screenHeight)).toBe(667);
      expect(get(isMobile)).toBe(true);
      expect(get(isTablet)).toBe(false);
      expect(get(isDesktop)).toBe(false);
    });

    it('sets tablet breakpoint correctly', () => {
      setScreenSize(1024, 768);

      expect(get(screenWidth)).toBe(1024);
      expect(get(screenHeight)).toBe(768);
      expect(get(isMobile)).toBe(false);
      expect(get(isTablet)).toBe(true);
      expect(get(isDesktop)).toBe(false);
    });

    it('sets desktop breakpoint correctly', () => {
      setScreenSize(1920, 1080);

      expect(get(screenWidth)).toBe(1920);
      expect(get(screenHeight)).toBe(1080);
      expect(get(isMobile)).toBe(false);
      expect(get(isTablet)).toBe(false);
      expect(get(isDesktop)).toBe(true);
    });

    it('handles mobile/tablet boundary (768px)', () => {
      setScreenSize(768, 1024);

      expect(get(isMobile)).toBe(false);
      expect(get(isTablet)).toBe(true);
      expect(get(isDesktop)).toBe(false);
    });

    it('handles tablet/desktop boundary (1280px)', () => {
      setScreenSize(1280, 800);

      expect(get(isMobile)).toBe(false);
      expect(get(isTablet)).toBe(false);
      expect(get(isDesktop)).toBe(true);
    });

    it('handles very small mobile screens', () => {
      setScreenSize(320, 568);

      expect(get(isMobile)).toBe(true);
      expect(get(isTablet)).toBe(false);
      expect(get(isDesktop)).toBe(false);
    });

    it('handles very large desktop screens', () => {
      setScreenSize(3840, 2160);

      expect(get(isMobile)).toBe(false);
      expect(get(isTablet)).toBe(false);
      expect(get(isDesktop)).toBe(true);
    });
  });
});
