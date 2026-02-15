import { describe, expect, it, vi } from 'vitest';

import {
  downloadPexelsImage,
  importPexelsMedia,
  isAllowedPexelsHost,
} from '../../../lib/server/services/pexels-service';

describe('pexels-service', () => {
  it('validates allowed pexels hosts', () => {
    expect(isAllowedPexelsHost(new URL('https://images.pexels.com/photos/1/test.jpg'))).toBe(true);
    expect(isAllowedPexelsHost(new URL('https://pexels.com/photo/1'))).toBe(true);
    expect(isAllowedPexelsHost(new URL('https://example.com/photo.jpg'))).toBe(false);
  });

  it('downloads a pexels image and returns a File', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/png' } }));

    const file = await downloadPexelsImage('https://images.pexels.com/photos/1/pexels-photo-1.png');

    expect(file).toBeInstanceOf(File);
    expect(file.type).toBe('image/png');
    expect(file.name).toMatch(/^pexels-\d+\.png$/);
    fetchMock.mockRestore();
  });

  it('rejects non-pexels URLs', async () => {
    await expect(downloadPexelsImage('https://example.com/image.jpg')).rejects.toThrow(
      'Only Pexels image hosts are allowed.'
    );
  });

  it('throws when pexels image download fails', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('oops', { status: 404 }));

    await expect(downloadPexelsImage('https://images.pexels.com/photos/1/missing.jpg')).rejects.toThrow(
      'Unable to download image from Pexels.'
    );

    fetchMock.mockRestore();
  });

  it('imports pexels media into pocketbase collection', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'm1', file: 'x.jpg' });
    const pb = {
      collection: vi.fn(() => ({ create })),
    };

    const image = new File([new Uint8Array([1])], 'photo.jpg', { type: 'image/jpeg' });

    await importPexelsMedia(pb as any, image, {
      sourceUrl: 'https://images.pexels.com/photos/1/x.jpg',
      photoUrl: 'https://pexels.com/photo/1',
      photographer: 'Ada',
      photographerUrl: 'https://pexels.com/@ada',
      altText: 'Alt text',
      uploadedBy: 'user_1',
    });

    expect(pb.collection).toHaveBeenCalledWith('media');
    expect(create).toHaveBeenCalledTimes(1);
    const formData = create.mock.calls[0][0] as FormData;
    expect(formData.get('source')).toBe('pexels');
    expect(formData.get('source_url')).toBe('https://pexels.com/photo/1');
    expect(formData.get('alt_text')).toBe('Alt text');
    expect(formData.get('uploaded_by')).toBe('user_1');
  });
});
