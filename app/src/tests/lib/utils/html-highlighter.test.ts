import { describe, expect, it } from 'vitest';
import { escapeCode, highlightHtmlCode, highlightTag } from '../../../lib/utils/html-highlighter';

describe('html-highlighter utilities', () => {
  describe('escapeCode', () => {
    it('escapes HTML-sensitive characters', () => {
      expect(escapeCode(`<>&"'`)).toBe('&lt;&gt;&amp;&quot;&#39;');
    });

    it('returns empty string for empty input', () => {
      expect(escapeCode('')).toBe('');
    });
  });

  describe('highlightTag', () => {
    it('highlights opening tag with attributes', () => {
      const result = highlightTag('<a href="https://example.com" target="_blank">');

      expect(result).toContain('tipex-codejar-token-tag">a</span>');
      expect(result).toContain('tipex-codejar-token-attr">href</span>');
      expect(result).toContain('tipex-codejar-token-value">&quot;https://example.com&quot;</span>');
    });

    it('highlights closing tags', () => {
      const result = highlightTag('</section>');

      expect(result).toContain('tipex-codejar-token-punc">&lt;/</span>');
      expect(result).toContain('tipex-codejar-token-tag">section</span>');
      expect(result).toContain('tipex-codejar-token-punc">&gt;</span>');
    });

    it('highlights self-closing tags', () => {
      const result = highlightTag('<img src="x" />');

      expect(result).toContain('tipex-codejar-token-tag">img</span>');
      expect(result).toContain('tipex-codejar-token-punc">/&gt;</span>');
    });

    it('treats malformed tags as comment token output', () => {
      const result = highlightTag('< unclosed');

      expect(result).toContain('tipex-codejar-token-comment');
      expect(result).toContain('&lt; unclosed');
    });
  });

  describe('highlightHtmlCode', () => {
    it('highlights mixed HTML with comments and text', () => {
      const source = '<div class="x">Hello<!-- note --><span>world</span></div>';
      const result = highlightHtmlCode(source);

      expect(result).toContain('tipex-codejar-token-tag">div</span>');
      expect(result).toContain('tipex-codejar-token-comment">&lt;!-- note --&gt;</span>');
      expect(result).toContain('Hello');
      expect(result).toContain('world');
    });

    it('handles malformed input and preserves line wrappers', () => {
      const result = highlightHtmlCode('text only\n<broken');

      expect(result).toContain('tipex-codejar-line');
      expect(result).toContain('text only');
      expect(result).toContain('&lt;broken');
    });
  });
});
