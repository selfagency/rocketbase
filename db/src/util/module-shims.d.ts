declare module 'dotenv/config';

declare module 'radashi' {
  export function dash(input: string): string;
}

declare module '@ngneat/falso' {
  export function randCatchPhrase(): string;
  export function randCompanyName(): string;
  export function randJobTitle(): string;
  export function randNumber(options: { min: number; max: number }): number;
  export function randParagraph(options: { length: number }): string[];
  export function randPastDate(options: { years: number }): Date;
  export function randProduct(): { title?: string } | string;
  export function randProductCategory(): string;
  export function randProductName(): string;
  export function randSentence(): string;
  export function randUrl(): string;
  export function randWord(): string;
}

declare module 'pocketbase' {
  export default class PocketBase {
    constructor(baseUrl: string);
    collection(name: string): {
      getFirstListItem(filter: string): Promise<any>;
      create(data: unknown): Promise<any>;
    };
  }
}
