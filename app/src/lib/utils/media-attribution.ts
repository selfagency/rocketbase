type AttributionInput = {
  source?: string;
  sourceUrl?: string;
  attribution?: {
    photographer?: string;
    photographerUrl?: string;
    photoUrl?: string;
  };
};

export function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildAttribution(media: AttributionInput): string {
  if (media.source !== 'pexels') return '';

  const photographer = media.attribution?.photographer || 'Pexels contributor';
  const photographerUrl = media.attribution?.photographerUrl;
  const photoUrl = media.attribution?.photoUrl || media.sourceUrl;

  const photographerPart = photographerUrl
    ? `<a href="${escapeHtml(photographerUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(photographer)}</a>`
    : escapeHtml(photographer);

  const pexelsPart = photoUrl
    ? `<a href="${escapeHtml(photoUrl)}" target="_blank" rel="noopener noreferrer">Pexels</a>`
    : 'Pexels';

  return `Photo by ${photographerPart} on ${pexelsPart}`;
}

export function buildFigureHtml(imageUrl: string, altText: string, caption: string, attribution: string): string {
  const safeAltText = escapeHtml(altText || '');
  const safeCaption = caption ? escapeHtml(caption) : '';
  const captionText = [safeCaption, attribution].filter(Boolean).join(' · ');

  const imageHtml = `<img src="${escapeHtml(imageUrl)}" alt="${safeAltText}" />`;

  return captionText ? `<figure>${imageHtml}<figcaption>${captionText}</figcaption></figure>` : imageHtml;
}
