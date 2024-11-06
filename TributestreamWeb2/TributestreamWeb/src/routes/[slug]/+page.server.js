// src/routes/[slug]/+page.server.js
export async function load({ params }) {
    const { slug } = params;

    // Check if slug matches criteria
    if (slug.startsWith("celebration") || slug.startsWith("tributestream-for")) {
        // Construct the WordPress URL
        const wpUrl = `https://wp.tributestream.com/${slug}`;

        // Return the URL to be embedded
        return { wpUrl };
    }

    // Handle other routes as usual
    return { /* other data here */ };
}
