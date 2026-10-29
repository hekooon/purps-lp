import { defineMiddleware } from 'astro:middleware';
import { polishHtml } from './utils/typography';

// Every HTML page goes through the typographic clean-up in utils/typography
// as it's rendered, in dev and when the site is built, so any copy, anywhere,
// gets it without anything to remember
export const onRequest = defineMiddleware(async (_context, next) => {
	const response = await next();
	if (!response.headers.get('content-type')?.includes('text/html')) return response;
	const html = polishHtml(await response.text());
	return new Response(html, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers,
	});
});
