// @ts-check
import { existsSync } from 'node:fs';
import { defineConfig } from 'astro/config';

// The Purps prototype is served through this site's own domain so the page
// can draw a custom cursor over it (a cross-origin iframe hides the mouse
// from the parent page). These are the root paths the prototype loads from;
// production proxies them with the rewrites in vercel.json.
const PROTOTYPE_ORIGIN = 'https://purps-demo-main.vercel.app';
const PROTOTYPE_PATHS = ['/prototypes', '/assets', '/fonts', '/icons'];

// Our own files in public/ (e.g. public/fonts) win over the proxy, as on Vercel
const servedLocally = (/** @type {import('node:http').IncomingMessage} */ req) => {
	const path = (req.url ?? '').split('?')[0];
	return existsSync(new URL(`./public${decodeURIComponent(path)}`, import.meta.url))
		? req.url
		: undefined;
};

// https://astro.build/config
export default defineConfig({
	vite: {
		server: {
			proxy: Object.fromEntries(
				PROTOTYPE_PATHS.map((path) => [
					path,
					{ target: PROTOTYPE_ORIGIN, changeOrigin: true, bypass: servedLocally },
				]),
			),
		},
	},
});
