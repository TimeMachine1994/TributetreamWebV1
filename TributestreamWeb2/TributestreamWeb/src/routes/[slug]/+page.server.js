export async function load({ params }) {
    const { slug } = params;

    try {
        // Fetch tribute data from the REST API
        const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tribute/${slug}`);

        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
            return { status: response.status, body: `Error fetching tribute: ${response.statusText}` };
        }

        // Parse the JSON data from the response
        const tributeData = await response.json();

        // Return the tribute data to be used in the Svelte page
        return {
            tribute: tributeData
        };

    } catch (error) {
        // Log any unexpected errors and return a 500 status
        console.error('Unexpected error:', error);
        return { status: 500, body: 'Internal Server Error' };
    }
}
