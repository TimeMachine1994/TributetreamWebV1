
export const load: PageServerLoad = async (event) => {
    console.log('Starting dashboard data load');
    const API_BASE = 'https://wp.tributestream.com/wp-json/custom/v1';
    
    try {
        console.log('Fetching tributes and streams...');
        const [tributesRes, streamsRes] = await Promise.all([
            fetchWithAuth(`${API_BASE}/wpa2_tributes`, { method: 'GET' }, event),
            fetchWithAuth(`${API_BASE}/streams`, { method: 'GET' }, event)
        ]);

        const tributes = await tributesRes.json();
        const streams = await streamsRes.json();
        
        console.log('Fetched data:', { tributes, streams });
        
        return {
            tributes,
            streams
        };
    } catch (error) {
        console.error('Load error:', error);
        return {
            tributes: [],
            streams: [],
            error: 'Failed to load data'
        };
    }
};