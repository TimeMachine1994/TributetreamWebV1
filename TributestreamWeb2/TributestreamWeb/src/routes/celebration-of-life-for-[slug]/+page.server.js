import { wordpressPages } from '$lib/pages.js';

export async function load({ params }) {
    const { slug } = params;
    console.log('Received slug:', slug);
    console.log('WordPress pages array:', wordpressPages);
    
    const fullSlug = `celebration-of-life-for-${slug}`;
    console.log('Generated full slug:', fullSlug);

    if (wordpressPages.includes(slug)) {
        console.log('Slug match found! Redirecting to WordPress:', `https://wp.tributestream.com/celebration-of-life-for-${slug}`);
        return {
            redirect: `https://wp.tributestream.com/celebration-of-life-for-${slug}`
        };
    }
    console.log('No WordPress match found, proceeding with API fetch');

    try {
        const apiUrl = `https://wp.tributestream.com/wp-json/tributestream/v1/tribute/${slug}`;
        console.log('Attempting API fetch from:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const tributeData = await response.json();
        console.log('API Response data:', tributeData);

        if (!tributeData) {
            console.log('No tribute data found');
            return {
                status: 404,
                error: new Error('Tribute not found')
            };
        }

        console.log('Successfully retrieved tribute data');
        return {
            tribute: tributeData
        };

    } catch (error) {
        console.error('API fetch error details:', error);
        return {
            status: 500,
            error: new Error('Failed to load tribute data')
        };
    }
}
