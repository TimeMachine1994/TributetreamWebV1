// ==============================
// API Utility for Fetching Data
// ==============================

// Base URL for your WordPress REST API
const API_BASE_URL = 'https://wp.tributestream.com/wp-json';

// Utility to get JWT token from localStorage
export const getToken = () => localStorage.getItem('token');

// Function to validate a JWT token remotely
export const validateToken = async () => {
    const token = getToken();
    if (!token) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/jwt-auth/v1/token/validate`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.ok; // Token is valid if response is OK
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
};

// Wrapper for making API requests with the JWT token
export const apiFetch = async (endpoint, options = {}) => {
    const token = getToken();
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
