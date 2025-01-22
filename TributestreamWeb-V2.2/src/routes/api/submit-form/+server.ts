import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Handles POST requests for form submissions
 * Validates and processes the submitted form data
 * Returns success/error response
 */
export const POST: RequestHandler = async ({ request }) => {
    console.log('Received form submission request');

    try {
        // Parse and validate the form data
        const formData = await request.json();
        console.log('Received form data:', formData);

        // Validate required fields
        const requiredFields = {
            director: ['firstName', 'lastName'],
            familyMember: ['firstName', 'lastName', 'dateOfBirth'],
            deceased: ['firstName', 'lastName', 'dateOfBirth', 'dateOfPassing'],
            contact: ['email', 'phone'],
            memorial: ['locationName', 'locationAddress', 'time', 'date']
        };

        // Check for missing required fields
        for (const [section, fields] of Object.entries(requiredFields)) {
            for (const field of fields) {
                if (!formData[section]?.[field]) {
                    console.error(`Missing required field: ${section}.${field}`);
                    return json(
                        { message: `Missing required field: ${section}.${field}` },
                        { status: 400 }
                    );
                }
            }
        }

        // Here you would typically save the form data to a database
        // For now, we'll just log it
        console.log('Form validation successful');
        console.log('Form data would be saved to database:', formData);
        
        // Return success response
        console.log('Sending success response');
        return json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Form submission error:', error);
        return json(
            { message: 'Failed to submit form' },
            { status: 500 }
        );
    }
};
