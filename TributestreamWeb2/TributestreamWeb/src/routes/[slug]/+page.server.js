// src/routes/[slug]/+page.server.js
export async function load({ params }) {
    const { slug } = params;

    // First check if this is a new Svelte-created page
    try {
        const response = await fetch('/api/check-page-type', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug })
        });
        
        const pageData = await response.json();
        
        if (pageData.isV2) {
            // Load Svelte template
            return {
                template: 'celebration-v2',
                slug: slug
            };
        }
    } catch (error) {
        console.log('Error checking page type:', error);
    }

    // If not a V2 page, handle legacy WordPress redirect
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

    return { status: 404, body: "Content not found" };
}
