export async function load({ fetch }) {
    const token = localStorage.getItem('jwtToken');
    const API_BASE_URL = 'https://tributestream.com/wp-json';

    const response = await fetch(`${API_BASE_URL}/my-custom-plugin/v1/get-user-data`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const userData = await response.json();
        return {
            userData
        };
    } else {
        return {
            status: response.status,
            error: new Error('Failed to fetch user data')
        };
    }
}
