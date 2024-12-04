import { api } from '../apiHandler';

interface RegistrationData {
    username: string;
    email: string;
    password: string;
}

interface RegistrationResponse {
    user_id: string;
    message: string;
}

export const registrationService = {
    async register(userData: RegistrationData) {
        return api.request<RegistrationResponse>('/wp-json/tributestream/v1/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
};
