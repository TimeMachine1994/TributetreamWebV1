import { redirect } from '@sveltejs/kit';
import { wordpressPages } from './lib/pages.js';

export async function handle({ event, resolve }) {
    const url = new URL(event.request.url);
    const slug = url.pathname.split('/').pop();

    // Skip non-page requests or slugs you don't care about
    if (!slug || (!url.pathname.startsWith('/celebration-of-life-for') && !url.pathname.startsWith('/tributestream-for'))) {
        return await resolve(event);
    }

    // Check if the slug is in the imported data and if it's a v2 page
    const page = wordpressPages.find(p => p.slug === slug);

    if (page && page.v2page) {
        // If it is a "v2" page, continue handling the request within SvelteKit
        return await resolve(event);
    } else {
        // If it is not a "v2" page, redirect to WordPress
        throw redirect(302, `https://wp.tributestream.com${url.pathname}`);
    }
}
