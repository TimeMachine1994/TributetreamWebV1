import { wordpressPages } from '$lib/pages.js';

export async function load({ params }) {
    const { slug } = params;
    console.log(slug);
    const fullSlug = `celebration-of-life-for-${slug}`;

    if (wordpressPages.includes(slug)) {
        return {
            redirect: `https://wp.tributestream.com/celebration-of-life-for-${slug}`
        };
    }

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
