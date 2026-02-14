import { env } from '$env/dynamic/public';
import PocketBase from 'pocketbase';
import { assign, omit } from 'radashi';
import type { TypedPocketBase } from '../types/pocketbase';

export function createPocketBaseClient(): TypedPocketBase {
	const pb = new PocketBase(
		env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090'
	) as TypedPocketBase;
	pb.autoCancellation(false);

	// Automatically flatten expanded fields into the main object
	pb.afterSend = function (_, data) {
		return omit(assign(data, data.expand || {}), ['expand']);
	};

	return pb;
}
