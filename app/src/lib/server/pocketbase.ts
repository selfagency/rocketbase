import { env } from '$env/dynamic/public';
import PocketBase from 'pocketbase';
import type { TypedPocketBase } from '../types/pocketbase';

export function createPocketBaseClient(): TypedPocketBase {
	return new PocketBase(env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090') as TypedPocketBase;
}
