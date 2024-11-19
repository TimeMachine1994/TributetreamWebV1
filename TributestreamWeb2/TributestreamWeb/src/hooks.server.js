import { redirect } from '@sveltejs/kit';
import { wordpressPages } from './lib/pages.js';

export async function handle({ event, resolve }) {
    const url = new URL(event.request.url);
    const slug = url.pathname.split('/').pop();

    // Skip non-page requests or slugs you don't care about
    if (!slug || (!url.pathname.startsWith('/celebration-of-life-for') && !url.pathname.startsWith('/tributestream-for'))) {
        return await resolve(event);
    }

    // Check if the slug exists in wordpressPages
    const page = wordpressPages.find(p => p.slug === slug);

    if (page) {
        // If slug exists in wordpressPages, redirect to WordPress
        throw redirect(302, `https://wp.tributestream.com${url.pathname}`);
    } else {
        // If slug is not found in wordpressPages, handle with SvelteKit
        return await resolve(event);
    }
}
