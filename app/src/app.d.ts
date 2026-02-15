// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { LogLayer } from 'loglayer';
import type { TypedPocketBase, UsersResponse } from './lib/types/pocketbase';
import '@poppanator/sveltekit-svg/dist/svg.d.ts';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      logger: LogLayer;
      pb: TypedPocketBase;
      user: UsersResponse | null;
      requestId: string;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
