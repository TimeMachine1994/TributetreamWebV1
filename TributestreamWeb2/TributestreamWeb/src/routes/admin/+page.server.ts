import { error } from '@sveltejs/kit';

const API_BASE_URL = 'https://wp.tributestream.com/wp-json/tributestream/v1';

export const actions = {
    createTribute: async ({ request, fetch }) => {
        const data = await request.formData();

        try {
            const res = await fetch(`${API_BASE_URL}/tribute`, {
                method: 'POST',
                headers: {
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
    }
};
