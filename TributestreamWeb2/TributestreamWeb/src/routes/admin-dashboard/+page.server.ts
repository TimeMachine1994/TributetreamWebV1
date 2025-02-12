import { error, json } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Tribute } from '../../types/tribute';

type ErrorWithCode = {
	message: string;
	status?: number;
};

export const actions = {
	getTribute: async ({ url, fetch, locals }) => {
		try {
			const id = url.searchParams.get('id');
			if (!id) {
				return { success: false, error: 'No tribute ID provided' };
			}

			const response = await fetch(`/api/tributestream/v1/tributes/${id}`, {
				headers: {
					'Authorization': `Bearer ${locals.jwt}`,
					'Accept': 'application/json'
				}
			});

			if (!response.ok) {
				return { success: false, error: 'Failed to fetch tribute' };
			}

			const tribute = await response.json();
			return { success: true, tribute };
		} catch (err) {
			console.error('[getTribute] Error:', err);
			return { 
				success: false, 
				error: err instanceof Error ? err.message : 'An unknown error occurred' 
			};
		}
	},

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

			// Construct the updates object with proper field mapping
			const updates = {
				loved_one_name: formData.get('loved_one_name'),
				custom_html: formData.get('html_content'), // Map html_content to custom_html for WordPress
				slug: formData.get('slug'),
				updated_at: new Date().toISOString() // Add updated timestamp
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
				let errorMessage = 'Failed to update tribute';
				try {
					const errorData = JSON.parse(responseText);
					errorMessage = errorData.message || errorData.error || errorMessage;
				} catch (parseError) {
					console.error('[updateTribute] Error parsing response:', parseError);
				}
				return { success: false, error: errorMessage };
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

export const load: PageServerLoad = async ({ fetch, locals }) => {
	console.log('[load] Starting tribute data fetch...');
	console.log('[load] JWT Token:', locals.jwt ? 'Provided' : 'Not provided');

	try {
		// Fetching tributes with JWT authentication
		const apiEndpoint = '/api/tributestream/v1/tributes';
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

			// Extract tributes from standardized response
			const tributes = data.tributes ?? [];
			console.log('[load] Extracted tributes:', tributes);

			const transformedTributes = tributes.map((tribute: Record<string, any>) => ({
				id: tribute.id,
				loved_one_name: tribute.loved_one_name,
				html_content: tribute.custom_html || '', // Map custom_html from WordPress to html_content for frontend
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
