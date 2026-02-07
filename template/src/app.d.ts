// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { TypedPocketBase, UsersResponse } from './pocketbase';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			pb: TypedPocketBase;
			user: UsersResponse | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
