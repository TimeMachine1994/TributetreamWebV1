import { api } from '../apiHandler';

interface LoginCredentials {
    username: string;
    password: string;
}

interface TokenResponse {
    token: string;
    user_display_name: string;
    user_email: string;
    user_nicename: string;
}

export const authService = {
    async login(credentials: LoginCredentials) {
        const response = await api.request<TokenResponse>('/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (response.data?.token) {
            api.setToken(response.data.token);
        }

        return response;
    },

    async validateToken() {
        return api.request('/wp-json/jwt-auth/v1/token/validate', {
            method: 'POST'
        });
    }
};
