import { env } from '$env/dynamic/public';
import PocketBase from 'pocketbase';
import { assign, omit } from 'radashi';
import type { TypedPocketBase } from '../types/pocketbase';

export function createPocketBaseClient(): TypedPocketBase {
  const pb = new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090') as TypedPocketBase;
  pb.autoCancellation(false);

  // Automatically flatten expanded fields into the main object
  pb.afterSend = function (_, data) {
    if (data?.items && Array.isArray(data.items)) {
      data.items = data.items.map((item: any) => omit(assign(item, item.expand || {}), ['expand']));
      return data;
    }
    return omit(assign(data, data.expand || {}), ['expand']);
  };

  return pb;
}
