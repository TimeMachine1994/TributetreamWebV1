async function fetchContentFromDatabase(slug) {
    const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tribute/${slug}`);
     
    if (!response.ok) {
        throw new Error('Failed to fetch content from the database');
    }
    console.log(response);

    return response.json();
}

export async function load({ params }) {
    const { slug } = params;

    try {
        // Fetch content from the database
        const tributeData = await fetchContentFromDatabase(slug);

        // If we find the tribute in our database, return the data
        if (tributeData) {
            return {
                tribute: tributeData
            };
        }

        // If not in our database, check if it's a WordPress pattern to redirect
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

        // If neither in database nor WordPress pattern, return 404
        return { status: 404, body: "Content not found" };

    } catch (error) {
        console.error('Unexpected error:', error);
        return { status: 500, body: 'Internal Server Error' };
    }
}
