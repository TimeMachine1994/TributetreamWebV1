import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

/**
 * Parse form data from FormData object
 * @param formData - FormData object from request
 * @returns Parsed form data object
 */
function parseFormData(formData: FormData) {
    return {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        message: formData.get('message') as string
    };
}

/**
 * Validate required form fields
 * @param data - Form data object
 * @returns Validation result with errors if any
 */
function validateForm(data: ReturnType<typeof parseFormData>) {
    const errors: string[] = [];
    
    // Validate required fields
    if (!data.name || data.name.trim() === '') {
        errors.push('Name is required');
    }
    
    if (!data.email || data.email.trim() === '') {
        errors.push('Email is required');
    } else if (!data.email.includes('@')) {
        errors.push('Please enter a valid email address');
    }
    
    if (!data.message || data.message.trim() === '') {
        errors.push('Message is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

export const actions = {
    default: async ({ request, fetch }) => {
        console.log('🚀 Starting contact-us form action.');
        
        try {
            // Step 1: Parse form data
            console.log('📝 Parsing form data...');
            const formData = await request.formData();
            const data = parseFormData(formData);
            
            // Step 2: Validate form data
            console.log('🔍 Validating form data...');
            const validation = validateForm(data);
            
            if (!validation.isValid) {
                console.error('❌ Validation errors:', validation.errors);
                
                // Map validation errors to form field names
                const fieldErrors: Record<string, string> = {};
                
                validation.errors.forEach(error => {
                    if (error.includes('Name')) {
                        fieldErrors['name'] = error;
                    } else if (error.includes('Email')) {
                        fieldErrors['email'] = error;
                    } else if (error.includes('Message')) {
                        fieldErrors['message'] = error;
                    }
                });
                
                return fail(400, {
                    error: true,
                    message: validation.errors.join('. '),
                    errors: fieldErrors,
                    formData: data
                });
            }
            
            // Step 3: Prepare email data
            console.log('📧 Preparing email data...');
            const emailData = {
                // Format the data for both customer and internal emails
                name: data.name,
                email: data.email,
                phone: data.phone || 'Not provided',
                message: data.message,
                submissionDate: new Date().toISOString(),
                familyMemberLastName: data.name.split(' ').pop() || 'Customer' // Used by the email service
            };
            
            // Step 4: Send emails using the email API
            console.log('📤 Sending emails...');
            const emailResponse = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'dual',
                    formData: emailData
                })
            });
            
            const emailResult = await emailResponse.json();
            
            if (!emailResult.success) {
                console.error('❌ Email sending failed:', emailResult);
                return fail(500, {
                    error: true,
                    message: 'Failed to send your message. Please try again or contact us directly.',
                    formData: data
                });
            }
            
            console.log('✅ Emails sent successfully');
            
            // Return success response
            return {
                success: true,
                message: 'Your message has been sent, check your email.'
            };
            
        } catch (error) {
            console.error('💥 Unexpected error:', error);
            return fail(500, {
                error: true,
                message: 'An unexpected error occurred. Please try again or contact us directly.',
                formData: {}
            });
        }
    }
} satisfies Actions;