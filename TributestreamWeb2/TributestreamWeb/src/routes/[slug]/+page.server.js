// +page.server.js remains the same
export async function load({ params }) {
    const { slug } = params;
    if (slug.startsWith("celebration") || slug.startsWith("tributestream-for")) {
        const wpUrl = `https://wp.tributestream.com/${slug}`;
        return { wpUrl };
    }
    return { wpUrl: null };
}
