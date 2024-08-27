export async function load({ params }) {
    const res = await fetch(`https://tributestream.com/wp-json/wp/v2/pages?slug=${params.slug}`);
    const page = await res.json();

    if (page.length === 0) {
        return {
            status: 404,
            error: new Error('Page not found')
        };
    }

    return {
        props: {
            page: page[0]
        }
    };
}
