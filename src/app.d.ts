import type { ILogLayer } from 'loglauyer';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			log: ILogLayer;
			reqtime: number;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
