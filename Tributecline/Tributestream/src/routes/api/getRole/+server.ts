import { json } from '@sveltejs/kit';

// Your full endpoint for retrieving a user role:
const WP_ROLE_URL = 'http://www.wp.tributestream.com/wp-json/tributestream/v1/getRole';

export async function GET({ url }) {
	// 1) Get the userId from query params
	const userId = url.searchParams.get('id');
	if (!userId) {
		return new Response(
			JSON.stringify({ error: 'User ID is required' }),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	// 2) Construct the URL (we append ?id=userId)
	const wpUrl = `${WP_ROLE_URL}?id=${userId}`;

	try {
		// 3) Fetch from your WP endpoint
		const res = await fetch(wpUrl);

		if (!res.ok) {
			// Pass along WP's error body/status if available
			return new Response(await res.text(), {
				status: res.status
			});
		}

		// 4) Return the JSON result
		const data = await res.json();
		return json(data);
	} catch (error) {
		return new Response(
			JSON.stringify({ error: 'Failed to fetch user role' }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
}
