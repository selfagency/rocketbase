import { deLocalizeUrl } from '$lib/paraglide/runtime';

const reroute = (request: Request) => deLocalizeUrl(request.url).pathname;

export { reroute };
