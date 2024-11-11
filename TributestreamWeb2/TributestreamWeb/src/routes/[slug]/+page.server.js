export async function load({ params, fetch }) {
    const { slug } = params;
    console.log(slug);
    
    try {
        const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tribute/${slug}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const tributeData = await response.json();

        if (!tributeData) {
            return {
                status: 404,
                error: new Error('Tribute not found')
            };
        }

        return {
            tribute: tributeData
        };

    } catch (error) {
        console.error('Error fetching tribute:', error);
        return {
            status: 500,
            error: new Error('Failed to load tribute data')
        };
    }
}
