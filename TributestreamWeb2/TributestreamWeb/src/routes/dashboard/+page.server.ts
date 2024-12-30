export async function load({ locals }) {
 

    console.log('📡 Making API Request to Tributes Endpoint');
    const response = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tribute', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${locals.jwt}`,
            'Content-Type': 'application/json'
        }
    });

    console.log('📥 API Response Status:', response.status);
    console.log('📤 API Response Headers:', Object.fromEntries(response.headers.entries()));

    const tributes = await response.json();
    console.log('📦 Parsed Tributes Data:', tributes);

    console.log('🔄 Returning Data to Frontend');
    console.log('🔄 Final Data to Return:', {
        tributes,
        requestId: locals.jwt,
        timestamp: new Date().toISOString(),
    });
    return {
        tributes,
        requestId: locals.jwt,
        timestamp: new Date().toISOString()
    };
}
