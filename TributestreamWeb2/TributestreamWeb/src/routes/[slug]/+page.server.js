// src/routes/[slug]/+page.server.js

import { json } from '@sveltejs/kit';

export async function load({ params }) {
    const { slug } = params;

    // WordPress REST API endpoint to query posts with the custom field
    const wpApiUrl = `https://wp.tributestream.com/wp-json/wp/v2/posts?meta_key=new_slug&meta_value=${slug}`;

    try {
        const response = await fetch(wpApiUrl);

        if (!response.ok) {
            console.error('Error fetching from WordPress:', await response.text());
            return { status: 500, body: 'Internal Server Error' };
        }

        const posts = await response.json();

        // Check if the slug exists in the response
        if (posts.length > 0) {
            // Slug exists, render the page with the template
            return {
                template: 'celebration-v2',
                slug: slug,
                // Add any other data you want to pass to the template
            };
        }

        // Handle specific slug patterns for redirection
        if (slug.startsWith("celebration") || slug.startsWith("tributestream-for")) {
            return {
                status: 302,
                headers: {
                    location: `https://wp.tributestream.com/${slug}`,
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
            };
        }

        // Slug not found, return 404
        return { status: 404, body: "Content not found" };
    } catch (error) {
        console.error('Unexpected error:', error);
        return { status: 500, body: 'Internal Server Error' };
    }
}
