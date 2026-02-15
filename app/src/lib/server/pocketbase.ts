import { env } from '$env/dynamic/public';
import PocketBase from 'pocketbase';
import { assign, omit } from 'radashi';
import type { TypedPocketBase } from '../types/pocketbase';

function flattenExpandedRecord(data: unknown): unknown {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data;
  }

  const record = data as Record<string, unknown>;
  return omit(assign(record, (record.expand as Record<string, unknown>) || {}), ['expand']);
}

export function createPocketBaseClient(): TypedPocketBase {
  const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090') as TypedPocketBase;
  pb.autoCancellation(false);

  // Automatically flatten expanded fields into the main object
  pb.afterSend = function (_, data) {
    if (Array.isArray(data)) {
      return data.map(item => flattenExpandedRecord(item));
    }

    if (data?.items && Array.isArray(data.items)) {
      data.items = data.items.map((item: unknown) => flattenExpandedRecord(item));
      return data;
    }

    return flattenExpandedRecord(data);
  };

  return pb;
}
