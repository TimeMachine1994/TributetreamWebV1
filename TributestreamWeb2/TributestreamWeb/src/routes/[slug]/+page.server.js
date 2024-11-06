// src/routes/[slug]/+page.server.js
export async function load({ params }) {
    const { slug } = params;
    
    // Check if slug matches criteria
    if (slug.startsWith("celebration") || slug.startsWith("tributestream-for")) {
        // Construct the WordPress URL
        const wpUrl = `https://wp.tributestream.com/${slug}`;
        
        // Fetch the content from WordPress
        const response = await fetch(wpUrl);
        
        if (response.ok) {
            const html = await response.text();
            return { html };
        } else {
            throw new Error("Page not found on WordPress.");
        }
    }
    
    // If no match, handle as usual
    return { /* other data here */ };
}
