export async function load({ params }) {
    const { slug } = params;

    try {
        // First check if this is a tribute in our database
        const tributeResponse = await fetch(`https://wp.tributestream.com/tributestream/v1/tribute/${slug}`);
        const tributeData = await tributeResponse.json();

        // If we find the tribute in our database, return the data
        if (tributeResponse.ok) {
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
