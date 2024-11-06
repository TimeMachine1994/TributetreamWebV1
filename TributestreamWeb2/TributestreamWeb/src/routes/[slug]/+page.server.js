// src/routes/[slug]/+page.server.js
export async function load({ params }) {
    const { slug } = params;

    // Check if slug matches criteria
    if (slug.startsWith("celebration") || slug.startsWith("tributestream-for")) {
        // Construct the WordPress URL
        const wpUrl = `https://wp.tributestream.com/${slug}`;
        
        try {
            // Fetch content from WordPress
            const response = await fetch(wpUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
                    "Accept": "text/html",
                },
            });
            
            // Check if the fetch was successful
            if (!response.ok) {
                console.error(`Failed to fetch from WordPress: ${response.status} ${response.statusText}`);
                throw new Error("Failed to load content from WordPress");
            }

            // Retrieve HTML content
            const html = await response.text();
            return { html };
        } catch (error) {
            console.error("Error fetching WordPress content:", error);
            throw new Error("Content fetch error");
        }
    }

    // If no match, return empty or default response
    return { html: null };
}
