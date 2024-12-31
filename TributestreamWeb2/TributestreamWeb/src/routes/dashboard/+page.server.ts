import type { Actions } from '@sveltejs/kit';
export const ssr = true;

export async function load({ locals }) {
    
    console.log('📡 Making API Request to Tributes Endpoint');
    const response = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tribute', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${locals.jwt}`,
            'Content-Type': 'application/json',
        },
    });

    // console.log('📥 API Response Status:', response.status);
    // console.log('📤 API Response Headers:', Object.fromEntries(response.headers.entries()));

    const tributes = await response.json();
    // console.log('📦 Parsed Tributes Data:', tributes);

    return {
        tributes,
        requestId: locals.jwt,
        timestamp: new Date().toISOString(),
    };
}
export const actions: Actions = {
    saveCustomHtml: async ({ request, locals }) => {
        console.log('🟢 Action triggered: saveCustomHtml');
        const formData = await request.formData();

        const tributeId = formData.get('tributeId');
        const customHtml = formData.get('customHtml');

        if (!tributeId || !customHtml) {
            console.error('❌ Invalid input received.');
            return { error: 'Invalid input. Both tributeId and customHtml are required.' };
        }

        try {
            console.log('🔵 Sending PUT request to update custom HTML.');
            const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tribute-event/${tributeId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${locals.jwt}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ custom_html: customHtml }),
            });

            if (!response.ok) {
                console.error('❌ API Error:', response.statusText);
                throw new Error(`Failed to update tribute: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ API Response:', result);

            return {
                success: true,
                message: 'Custom HTML updated successfully!',
                result,
            };
        } catch (error) {
            console.error('❌ Error saving custom HTML:', error);
            return {
                error: 'Failed to save custom HTML. Please try again.',
            };
        }
    },
};

