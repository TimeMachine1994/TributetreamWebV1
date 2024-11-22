// ==============================
// API Utility for Fetching Data
// ==============================

// Base URL for your WordPress REST API
const API_BASE_URL = 'https://wp.tributestream.com/wp-json';

// Utility to get JWT token from localStorage
 
// Function to validate a JWT token remotely
 
export async function validateToken(cookies) {
    const token = cookies.get('session');
    if (!token) return false;

    try {
        const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token/validate', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}
// Wrapper for making API requests with the JWT token
export const apiFetch = async (endpoint, options = {}) => {
    const token = cookies.get('session');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : undefined,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        console.error('API Request failed:', await response.json());
    }

    return response.json();
};
