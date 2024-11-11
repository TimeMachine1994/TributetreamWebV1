// src/routes/celebration-of-life-for-[slug]/+page.js
export async function load({ params }) {
    const slug = params.slug; // extract the slug from the URL

    // Fetch data from your custom REST API
    const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tribute/${slug}`);
    
    if (response.ok) {
        const data = await response.json();
        return { tribute: data }; // Return the fetched data
    } else {
        // If the slug is invalid, handle the error (e.g., show a 404 page)
        throw new Error('Tribute not found');
    }
}
