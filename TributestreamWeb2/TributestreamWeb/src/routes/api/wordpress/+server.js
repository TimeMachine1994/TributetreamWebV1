// File: /src/api/wordpress/+server.js
// Language: JavaScript (SvelteKit endpoint)

export async function GET(event) {
    console.log('🚀 [WordPress API] GET request received in +server.js');

    // For example: /api/wordpress?type=tributes or ?type=slugs
    const url = new URL(event.request.url);
    const type = url.searchParams.get('type');
    console.log('📝 [WordPress API] GET param "type":', type);

    // Grab the JWT we stashed in event.locals from hooks.server.ts
    const jwt = event.locals.jwt;
    console.log('🔐 [WordPress API] JWT from event.locals:', jwt);

    // Decide which WP route to call
    try {
        if (type === 'tributes') {
            console.log('➡️ [WordPress API] Fetching tributes from WP...');

            const wpResponse = await fetch('https://wp.tributestream.com/wp-json/api/v1/tributes', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwt}`, // Pass JWT as Bearer token
                    'Content-Type': 'application/json'
                }
            });

            const tributesData = await wpResponse.json();
            console.log('🛬 [WordPress API] tributesData from WP:', tributesData);

            if (!wpResponse.ok) {
                // Return WP error message
                return new Response(JSON.stringify({ error: tributesData }), { status: wpResponse.status });
            }

            // Return tributes data to the client
            return new Response(JSON.stringify(tributesData), { status: 200 });
        }
        else if (type === 'slugs') {
            console.log('➡️ [WordPress API] Fetching slugs from WP...');

            const wpResponse = await fetch('https://wp.tributestream.com/wp-json/api/v1/utils/slugs', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                }
            });

            const slugsData = await wpResponse.json();
            console.log('🛬 [WordPress API] slugsData from WP:', slugsData);

            if (!wpResponse.ok) {
                // Return WP error message
                return new Response(JSON.stringify({ error: slugsData }), { status: wpResponse.status });
            }

            // Return slug data to the client
            return new Response(JSON.stringify(slugsData), { status: 200 });
        }
        else {
            console.warn('⚠️ [WordPress API] Unknown "type" parameter. Returning bad request.');
            return new Response(JSON.stringify({ message: 'Unknown type parameter' }), { status: 400 });
        }
    } catch (error) {
        console.error('🚨 [WordPress API] Error in GET handler:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}

export async function POST(event) {
    console.log('🚀 [WordPress API] POST request received in +server.js');

    // Example usage:
    // fetch('/api/wordpress', {
    //   method: 'POST',
    //   body: JSON.stringify({ action: 'create_tribute', ...tributeData })
    // });
    let requestBody;

    try {
        requestBody = await event.request.json();
        console.log('📝 [WordPress API] POST requestBody:', requestBody);
    } catch (err) {
        console.error('❌ [WordPress API] Could not parse JSON body:', err);
        return new Response(JSON.stringify({ message: 'Invalid JSON request' }), { status: 400 });
    }

    const jwt = event.locals.jwt;
    console.log('🔐 [WordPress API] JWT from event.locals:', jwt);

    // Decide which action
    try {
        if (requestBody.action === 'create_tribute') {
            console.log('➡️ [WordPress API] Creating a new tribute in WP...');
            // POST /api/v1/tributes
            const wpResponse = await fetch('https://wp.tributestream.com/wp-json/api/v1/tributes', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody.tribute) // or however your data is structured
            });

            const result = await wpResponse.json();
            console.log('🛬 [WordPress API] create_tribute result:', result);

            if (!wpResponse.ok) {
                return new Response(JSON.stringify({ error: result }), { status: wpResponse.status });
            }

            return new Response(JSON.stringify(result), { status: 200 });
        }
        else {
            console.warn('⚠️ [WordPress API] Unknown "action" in POST body.');
            return new Response(JSON.stringify({ message: 'Unknown action' }), { status: 400 });
        }
    } catch (error) {
        console.error('🚨 [WordPress API] Error in POST handler:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}

export async function PUT(event) {
    console.log('🚀 [WordPress API] PUT request received in +server.js');

    // Example usage:
    // fetch('/api/wordpress', {
    //   method: 'PUT',
    //   body: JSON.stringify({
    //     action: 'update_tribute_custom_html',
    //     tribute_id: 123,
    //     custom_html: '<div>...</div>'
    //   })
    // });

    let requestBody;

    try {
        requestBody = await event.request.json();
        console.log('📝 [WordPress API] PUT requestBody:', requestBody);
    } catch (err) {
        console.error('❌ [WordPress API] Could not parse JSON body:', err);
        return new Response(JSON.stringify({ message: 'Invalid JSON request' }), { status: 400 });
    }

    const jwt = event.locals.jwt;
    console.log('🔐 [WordPress API] JWT from event.locals:', jwt);

    try {
        if (requestBody.action === 'update_tribute_custom_html') {
            const tributeId = requestBody.tribute_id;
            const customHtml = requestBody.custom_html;
            console.log('➡️ [WordPress API] Updating tribute custom HTML:', tributeId, customHtml);

            // PUT /api/v1/tributes/{tribute_id}/custom-html
            const wpResponse = await fetch(`https://wp.tributestream.com/wp-json/api/v1/tributes/${tributeId}/custom-html`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ custom_html: customHtml })
            });

            const result = await wpResponse.json();
            console.log('🛬 [WordPress API] update_tribute_custom_html result:', result);

            if (!wpResponse.ok) {
                return new Response(JSON.stringify({ error: result }), { status: wpResponse.status });
            }

            return new Response(JSON.stringify(result), { status: 200 });
        }
        else {
            console.warn('⚠️ [WordPress API] Unknown "action" in PUT body.');
            return new Response(JSON.stringify({ message: 'Unknown action' }), { status: 400 });
        }
    } catch (error) {
        console.error('🚨 [WordPress API] Error in PUT handler:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}
