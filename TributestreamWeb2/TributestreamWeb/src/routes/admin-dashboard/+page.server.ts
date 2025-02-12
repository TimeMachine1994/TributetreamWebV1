import { error, json } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Tribute } from '../../types/tribute';

type ErrorWithCode = {
	message: string;
	status?: number;
};

export const actions = {
	updateTribute: async ({ request, fetch, locals }) => {
		try {
			console.log('[updateTribute] Received request to update tribute.');

			// Parse and log the form data
			const formData = await request.formData();
			const formDataEntries = Object.fromEntries(formData.entries());
			console.log('[updateTribute] Form data received:', formDataEntries);

			const id = formData.get('id');
			if (!id) {
				console.error('[updateTribute] No tribute ID provided.');
				return { success: false, error: 'No tribute ID provided' };
			}
			console.log('[updateTribute] Tribute ID:', id);

			// Construct the updates object and log it
			const updates = {
				loved_one_name: formData.get('loved_one_name'),
				custom_html: formData.get('html_content'),
				slug: formData.get('slug')
			};
			console.log('[updateTribute] Updates to be sent:', updates);

			// Send the PUT request to the API endpoint
			const apiUrl = `/api/tributestream/v1/tributes/${id}`;
			console.log('[updateTribute] Sending PUT request to:', apiUrl);
			const response = await fetch(apiUrl, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${locals.jwt}`
				},
				body: JSON.stringify(updates)
			});

			console.log('[updateTribute] Response status:', response.status);
			// Optionally, log the response body if needed:
			const responseText = await response.text();
			console.log('[updateTribute] Response body:', responseText);

			if (!response.ok) {
				console.error('[updateTribute] Failed to update tribute, status:', response.status);
				return { success: false, error: 'Failed to update tribute' };
			}

			console.log('[updateTribute] Tribute updated successfully.');
			return { success: true };
		} catch (err) {
			console.error('[updateTribute] Update error:', err);
			return { 
				success: false, 
				error: err instanceof Error ? err.message : 'An unknown error occurred' 
			};
		}
	}
} satisfies Actions;

// Helper function to validate tribute array with extra logging
function isValidTributeArray(data: any): data is Tribute[] {
	console.log('[isValidTributeArray] Checking data validity:', data);
	const isValid = Array.isArray(data) && data.every(item =>
		typeof item === 'object' &&
		item !== null &&
		typeof item.id === 'string' &&
		typeof item.loved_one_name === 'string' &&
		typeof item.created_at === 'string' &&
		typeof item.slug === 'string' &&
		(item.html_content === undefined || typeof item.html_content === 'string')
	);

	console.log('[isValidTributeArray] Validation result:', isValid);
	return isValid;
}

export const load: PageServerLoad = async ({ fetch, locals }) => {
	console.log('[load] Starting tribute data fetch...');
	console.log('[load] JWT Token:', locals.jwt ? 'Provided' : 'Not provided');

	try {
		// Fetching tributes with JWT authentication
		const apiEndpoint = '/api/tributestream/v1/tribute';
		console.log('[load] Sending request to:', apiEndpoint);
		const response = await fetch(apiEndpoint, {
			headers: {
				'Authorization': `Bearer ${locals.jwt}`,
				'Accept': 'application/json'
			}
		});

		console.log('[load] Response received:', response);
		console.log('[load] Response status:', response.status);
		// Log headers (note: headers is a Headers object; you can iterate if needed)
		console.log('[load] Response headers:', JSON.stringify([...response.headers]));

		if (!response.ok) {
			console.error('[load] Fetch error:', response.statusText);
			throw error(response.status, {
				message: `Failed to fetch tributes: ${response.statusText}`
			} as ErrorWithCode);
		}

		try {
			console.log('[load] Parsing JSON response...');
			const data = await response.json();
			console.log('[load] Raw fetched data:', JSON.stringify(data, null, 2));

			if (!data || typeof data !== 'object') {
				console.error('[load] Invalid data structure:', data);
				throw new Error('Invalid response data structure');
			}

			// Handle both array and object with tributes property
			const tributes = Array.isArray(data) ? data : (data.tributes || []);
			console.log('[load] Extracted tributes:', tributes);

			if (!isValidTributeArray(tributes)) {
				console.error('[load] Invalid tributes structure:', tributes);
				throw new Error('Invalid tributes data structure');
			}

			const transformedTributes = tributes.map(tribute => ({
				id: tribute.id,
				loved_one_name: tribute.loved_one_name,
				html_content: tribute.html_content || '',
				created_at: tribute.created_at,
				slug: tribute.slug
			}));

			console.log('[load] Transformed tribute data:', transformedTributes);

			return {
				tributes: transformedTributes,
				totalPages: data.total_pages || 1
			};
		} catch (parseError) {
			console.error('[load] JSON Parsing Error:', parseError);
			throw error(500, {
				message: 'Failed to parse tribute data'
			} as ErrorWithCode);
		}
	} catch (err) {
		console.error('[load] General Error:', err);
		throw error(500, {
			message: 'Failed to load tributes'
		} as ErrorWithCode);
	}
};
