type PexelsImportMetadata = {
  sourceUrl: string;
  photoUrl: string;
  photographer: string;
  photographerUrl: string;
  altText: string;
  uploadedBy?: string;
};

type PocketBaseLike = {
  collection: (name: string) => {
    create: (data: FormData) => Promise<unknown>;
  };
};

export function isAllowedPexelsHost(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return host === 'pexels.com' || host.endsWith('.pexels.com');
}

export async function downloadPexelsImage(sourceUrl: string): Promise<File> {
  const parsedSource = new URL(sourceUrl);

  if (!isAllowedPexelsHost(parsedSource)) {
    throw new Error('Only Pexels image hosts are allowed.');
  }

  const imageResponse = await fetch(parsedSource);
  if (!imageResponse.ok) {
    throw new Error('Unable to download image from Pexels.');
  }

  const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
  const extension = mimeType.split('/')[1]?.split(';')[0] || 'jpg';
  const imageBytes = await imageResponse.arrayBuffer();

  return new File([imageBytes], `pexels-${Date.now()}.${extension}`, { type: mimeType });
}

export async function importPexelsMedia(
  pb: PocketBaseLike,
  imageFile: File,
  metadata: PexelsImportMetadata
): Promise<unknown> {
  const createFormData = new FormData();
  createFormData.append('file', imageFile);
  createFormData.append('source', 'pexels');
  createFormData.append('source_url', metadata.photoUrl);
  createFormData.append('alt_text', metadata.altText || `Photo by ${metadata.photographer} on Pexels`);
  createFormData.append(
    'metadata',
    JSON.stringify({
      provider: 'Pexels',
      photographer: metadata.photographer,
      photographerUrl: metadata.photographerUrl,
      photoUrl: metadata.photoUrl,
    })
  );

  if (metadata.uploadedBy) {
    createFormData.append('uploaded_by', metadata.uploadedBy);
  }

  return await pb.collection('media').create(createFormData);
}
