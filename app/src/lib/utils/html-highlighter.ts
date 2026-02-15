export function escapeCode(source: string): string {
  return source
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function highlightTag(tagSource: string): string {
  const tagMatch = tagSource.match(/^<(\/)?\s*([^\s/>]+)([\s\S]*?)(\/?)>$/);
  if (!tagMatch) {
    return `<span class="tipex-codejar-token-comment">${escapeCode(tagSource)}</span>`;
  }

  const [, closingSlash, tagName, rawAttributes, selfClosingSlash] = tagMatch;
  const attributes = rawAttributes || '';

  let attributesHtml = '';
  const attributeRegex = /([^\s=/>]+)(\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;
  let attrMatch: RegExpExecArray | null;

  while ((attrMatch = attributeRegex.exec(attributes)) !== null) {
    const [full, name, valuePart] = attrMatch;
    const prefix = full.match(/^\s*/)?.[0] || '';

    attributesHtml += escapeCode(prefix);
    attributesHtml += `<span class="tipex-codejar-token-attr">${escapeCode(name)}</span>`;

    if (valuePart) {
      const eqMatch = valuePart.match(/^(\s*=\s*)([\s\S]+)$/);
      if (eqMatch) {
        const [, eq, value] = eqMatch;
        attributesHtml += `<span class="tipex-codejar-token-punc">${escapeCode(eq)}</span>`;
        attributesHtml += `<span class="tipex-codejar-token-value">${escapeCode(value)}</span>`;
      }
    }
  }

  const open = closingSlash ? '</' : '<';
  const close = selfClosingSlash ? '/>' : '>';

  return [
    `<span class="tipex-codejar-token-punc">${escapeCode(open)}</span>`,
    `<span class="tipex-codejar-token-tag">${escapeCode(tagName)}</span>`,
    attributesHtml,
    `<span class="tipex-codejar-token-punc">${escapeCode(close)}</span>`,
  ].join('');
}

export function highlightHtmlCode(source: string): string {
  const tokenRegex = /<!--[\s\S]*?-->|<[^>]+>/g;
  let result = '';
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(source)) !== null) {
    const token = match[0];
    const index = match.index;

    if (index > cursor) {
      result += escapeCode(source.slice(cursor, index));
    }

    if (token.startsWith('<!--')) {
      result += `<span class="tipex-codejar-token-comment">${escapeCode(token)}</span>`;
    } else {
      result += highlightTag(token);
    }

    cursor = index + token.length;
  }

  if (cursor < source.length) {
    result += escapeCode(source.slice(cursor));
  }

  const lines = result.split('\n');

  return lines.map(line => `<span class="tipex-codejar-line">${line.length > 0 ? line : '&nbsp;'}</span>`).join('');
}
