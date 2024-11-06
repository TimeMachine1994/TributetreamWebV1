// src/routes/[slug]/+page.server.js
export async function load({ params, url }) {
    const { slug } = params;

    // Check if slug matches the criteria for redirection
    if (slug.startsWith("celebration") || slug.startsWith("tributestream-for")) {
        const wpUrl = `https://wp.tributestream.com/${slug}`;

        // Return a redirect response with CORS headers
        return {
            status: 302,
            headers: {
                location: wpUrl,
                "Access-Control-Allow-Origin": "*", // Allows any origin; adjust if needed for security
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Allow specific methods
                "Access-Control-Allow-Headers": "Content-Type, Authorization", // Allow these headers
            },
        };
    }

    // If slug doesn't match, continue as normal (or handle as a 404 if appropriate)
    return { status: 404, body: "Content not found" };
}
