import { describe, expect, it } from 'vitest';
import { sanitizeSnapshotValue, serializeSnapshot } from '../../../lib/utils/snapshot-serializer';

describe('snapshot-serializer utilities', () => {
  it('serializes plain objects', () => {
    const value = serializeSnapshot({ a: 1, nested: { ok: true } });
    expect(JSON.parse(value)).toEqual({ a: 1, nested: { ok: true } });
  });

  it('serializes Date values to ISO strings', () => {
    const value = serializeSnapshot({ date: new Date('2026-01-01T00:00:00.000Z') });
    expect(value).toContain('2026-01-01T00:00:00.000Z');
  });

  it('serializes File metadata objects', () => {
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg', lastModified: 123 });
    const value = JSON.parse(serializeSnapshot({ file }));

    expect(value.file).toMatchObject({
      __type: 'file',
      name: 'photo.jpg',
      size: 4,
      type: 'image/jpeg',
      lastModified: 123,
    });
  });

  it('serializes Blob metadata objects', () => {
    const blob = new Blob(['abc'], { type: 'text/plain' });
    const value = JSON.parse(serializeSnapshot({ blob }));

    expect(value.blob).toMatchObject({
      __type: 'blob',
      size: 3,
      type: 'text/plain',
    });
  });

  it('detects circular references', () => {
    const circular: Record<string, unknown> = { a: 1 };
    circular.self = circular;

    const value = JSON.parse(serializeSnapshot(circular));
    expect(value.self).toBe('[Circular]');
  });

  it('handles nested objects and arrays', () => {
    const value = JSON.parse(serializeSnapshot({ list: [{ x: 1 }, { y: 2 }] }));
    expect(value).toEqual({ list: [{ x: 1 }, { y: 2 }] });
  });

  it('sanitizeSnapshotValue removes File, Blob and circular references', () => {
    const file = new File(['x'], 'x.txt', { type: 'text/plain' });
    const blob = new Blob(['y'], { type: 'text/plain' });
    const circular: Record<string, unknown> = { keep: true, file, blob };
    circular.self = circular;

    const sanitized = sanitizeSnapshotValue(circular) as Record<string, unknown>;

    expect(sanitized).toEqual({ keep: true });
  });
});
