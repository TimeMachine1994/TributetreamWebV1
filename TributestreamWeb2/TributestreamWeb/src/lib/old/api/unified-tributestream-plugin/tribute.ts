import { api } from '../apiHandler';

interface TributeData {
    user_id: string;
    loved_one_name: string;
    slug: string;
}

interface TributeResponse {
    user_id: string;
    loved_one_name: string;
    slug: string;
}

export const tributeService = {
    async createTribute(tributeData: TributeData) {
        return api.request<TributeResponse>('/wp-json/tributestream/v1/tribute', {
            method: 'POST',
            body: JSON.stringify(tributeData)
        });
    }
};
