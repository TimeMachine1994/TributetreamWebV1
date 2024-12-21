import { fetchWithAuth } from '$lib/utils/fetchWithAuth';
import type { RequestEvent } from '@sveltejs/kit';

interface WPA2Stream {
    id: number;
    tribute_id: number;
    custom_embed: string;
}

interface WPA2Tribute {
    id: number;
    user_id: number;
    loved_one_name: string;
    slug: string;
    created_at: string;
    updated_at: string;
    custom_html: string;
    phone_number: string;
    number_of_streams: number;
}

export async function load(event: RequestEvent) {
    const API_BASE = 'https://wp.tributestream.com/wp-json/custom/v1';
    
    try {
        const [tributesRes, streamsRes] = await Promise.all([
            fetchWithAuth(`${API_BASE}/wpa2_tributes`, { method: 'GET' }, event),
            fetchWithAuth(`${API_BASE}/streams`, { method: 'GET' }, event)
        ]);

        const tributes: WPA2Tribute[] = await tributesRes.json();
        const streams: WPA2Stream[] = await streamsRes.json();

        return {
            tributes,
            streams,
            success: true
        };
    } catch (error) {
        console.error('Failed to fetch data:', error);
        return {
            tributes: [],
            streams: [],
            success: false,
            error: 'Failed to load data'
        };
    }
}
