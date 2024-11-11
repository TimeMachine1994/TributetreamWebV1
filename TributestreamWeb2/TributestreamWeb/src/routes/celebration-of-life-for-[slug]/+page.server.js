export async function load({ params, fetch }) {
    const { slug } = params;
    const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tribute/${slug}`);
    const tributeData = await response.json();
    
    return {
        tribute: tributeData
    };
}
