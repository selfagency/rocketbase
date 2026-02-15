function snapshotReplacer() {
  const seen = new WeakSet<object>();

  return (_key: string, value: unknown) => {
    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof File !== 'undefined' && value instanceof File) {
      return {
        __type: 'file',
        name: value.name,
        size: value.size,
        type: value.type,
        lastModified: value.lastModified,
      };
    }

    if (typeof Blob !== 'undefined' && value instanceof Blob) {
      return {
        __type: 'blob',
        size: value.size,
        type: value.type,
      };
    }

    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }

      seen.add(value);
    }

    return value;
  };
}

function sanitizeReplacer() {
  const seen = new WeakSet<object>();

  return (_key: string, value: unknown) => {
    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof File !== 'undefined' && value instanceof File) {
      return undefined;
    }

    if (typeof Blob !== 'undefined' && value instanceof Blob) {
      return undefined;
    }

    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return undefined;
      }

      seen.add(value);
    }

    return value;
  };
}

export function serializeSnapshot(snapshot: unknown): string {
  return JSON.stringify(snapshot, snapshotReplacer());
}

export function sanitizeSnapshotValue<T>(input: T): T {
  return JSON.parse(JSON.stringify(input, sanitizeReplacer())) as T;
}
