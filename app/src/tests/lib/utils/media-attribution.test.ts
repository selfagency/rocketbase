import { describe, expect, it } from 'vitest';
import { buildAttribution, buildFigureHtml, escapeHtml } from '../../../lib/utils/media-attribution';

describe('media-attribution utilities', () => {
  describe('escapeHtml', () => {
    it('escapes HTML entities and quotes', () => {
      expect(escapeHtml(`<>&"'`)).toBe('&lt;&gt;&amp;&quot;&#39;');
    });
  });

  describe('buildAttribution', () => {
    it('builds pexels attribution with full metadata', () => {
      const value = buildAttribution({
        source: 'pexels',
        sourceUrl: 'https://pexels.com/photo/1',
        attribution: {
          photographer: 'Ada',
          photographerUrl: 'https://pexels.com/@ada',
          photoUrl: 'https://pexels.com/photo/1',
        },
      });

      expect(value).toContain('Photo by');
      expect(value).toContain('href="https://pexels.com/@ada"');
      expect(value).toContain('href="https://pexels.com/photo/1"');
    });

    it('uses text photographer when photographerUrl is missing', () => {
      const value = buildAttribution({
        source: 'pexels',
        attribution: {
          photographer: 'No Link',
        },
      });

      expect(value).toContain('Photo by No Link on Pexels');
    });

    it('falls back to sourceUrl when photoUrl is missing', () => {
      const value = buildAttribution({
        source: 'pexels',
        sourceUrl: 'https://pexels.com/photo/fallback',
        attribution: {
          photographer: 'Ada',
          photographerUrl: 'https://pexels.com/@ada',
        },
      });

      expect(value).toContain('href="https://pexels.com/photo/fallback"');
    });

    it('returns empty string for non-pexels source', () => {
      expect(buildAttribution({ source: 'upload' })).toBe('');
    });
  });

  describe('buildFigureHtml', () => {
    it('returns image-only html when caption and attribution are empty', () => {
      const html = buildFigureHtml('https://cdn/image.jpg', 'Alt', '', '');

      expect(html).toBe('<img src="https://cdn/image.jpg" alt="Alt" />');
    });

    it('includes figcaption when caption exists', () => {
      const html = buildFigureHtml('https://cdn/image.jpg', 'Alt', 'Caption', '');

      expect(html).toContain('<figure>');
      expect(html).toContain('<figcaption>Caption</figcaption>');
    });

    it('includes attribution and combines caption + attribution', () => {
      const html = buildFigureHtml('https://cdn/image.jpg', 'Alt', 'Caption', 'Photo by Ada on Pexels');

      expect(html).toContain('<figcaption>Caption · Photo by Ada on Pexels</figcaption>');
    });
  });
});
