import { error, redirect } from '@sveltejs/kit';

const API_BASE_URL = 'https://wp.tributestream.com/wp-json/tributestream/v1';

/**
 * Load function to fetch tributes and live streams.
 */
export const load = async ({ cookies }) => {
	const token = cookies.get('token');

	if (!token) {
		throw redirect(302, '/login');
	}

	try {
		// Fetch all tributes
		const res = await fetch(`${API_BASE_URL}/tribute`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		if (!res.ok) throw error(res.status, 'Failed to fetch tributes');

		const tributes = await res.json();
		return { tributes };
	} catch (err) {
		console.error(err);
		throw error(500, 'Server error');
	}
};

/**
 * Actions for CRUD operations.
 */
export const actions = {
	createTribute: async ({ cookies, request }) => {
		const token = cookies.get('token');
		const data = await request.formData();

		try {
			const res = await fetch(`${API_BASE_URL}/tribute`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					user_id: data.get('user_id'),
					loved_one_name: data.get('loved_one_name'),
					slug: data.get('slug')
				})
			});

			if (!res.ok) throw error(res.status, 'Failed to create tribute');
			return { success: true };
		} catch (err) {
			console.error(err);
			return { success: false, error: 'Failed to create tribute' };
		}
	},
	deleteTribute: async ({ cookies, request }) => {
		const token = cookies.get('token');
		const data = await request.formData();
		const tributeId = data.get('id');

		try {
			const res = await fetch(`${API_BASE_URL}/tribute/${tributeId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (!res.ok) throw error(res.status, 'Failed to delete tribute');
			return { success: true };
		} catch (err) {
			console.error(err);
			return { success: false, error: 'Failed to delete tribute' };
		}
	}
};
