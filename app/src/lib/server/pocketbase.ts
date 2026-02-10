import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import PocketBase from 'pocketbase';
import type { TypedPocketBase } from '../types/pocketbase';

export function createPocketBaseClient(): TypedPocketBase {
  return new PocketBase(PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090') as TypedPocketBase;
}
