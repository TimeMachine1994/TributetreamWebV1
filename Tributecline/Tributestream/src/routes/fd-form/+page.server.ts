import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { RegisterData, MemorialFormData } from '$lib/types/api';
import { generateMemorialRequestEmail, generateWelcomeEmail } from '$lib/utils/emailTemplates';

// Function to generate a slug from the deceased's first and last name
function generateSlug(firstName: string, lastName: string): string {
    return `${firstName.trim().toLowerCase()}_${lastName.trim().toLowerCase()}`.replace(/\s+/g, '_');
}

// Function to generate a secure password that meets WordPress requirements
function generatePassword(): string {
    // Ensure at least one of each required character type
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // Get one of each required type
    const getLowercase = () => lowercase[Math.floor(Math.random() * lowercase.length)];
    const getUppercase = () => uppercase[Math.floor(Math.random() * uppercase.length)];
    const getNumber = () => numbers[Math.floor(Math.random() * numbers.length)];
    const getSpecial = () => special[Math.floor(Math.random() * special.length)];
    
    // Start with required characters
    let password = getLowercase() + getUppercase() + getNumber() + getSpecial();
    
    // Add additional random characters to reach desired length
    const allChars = lowercase + uppercase + numbers + special;
    const remainingLength = 16 - password.length;
    
    for (let i = 0; i < remainingLength; i++) {
        const randomChar = allChars[Math.floor(Math.random() * allChars.length)];
        // Insert at random position to avoid patterns
        const position = Math.floor(Math.random() * (password.length + 1));
        password = password.slice(0, position) + randomChar + password.slice(position);
    }
    
    return password;
}

async function sendEmail(
    emailData: { 
        to: string; 
        subject: string; 
        text: string; 
        html: string; 
    },
    fetch: Function,
    type: 'staff' | 'user'
): Promise<{ success: boolean; error?: string }> {
    try {
        console.log(`Attempting to send ${type} email to: ${emailData.to}`);
        
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error(`Failed to send ${type} email:`, result);
            throw new Error(result.error || `Failed to send ${type} email`);
        }

        console.log(`Successfully sent ${type} email to: ${emailData.to}`);
        return { success: true };
    } catch (error) {
        console.error(`Error sending ${type} email:`, error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : `Failed to send ${type} email` 
        };
    }
}

async function sendEmails(
    staffEmail: { subject: string; html: string; text: string; },
    userEmail: { subject: string; html: string; text: string; },
    fetch: Function
): Promise<{ success: boolean; error?: string }> {
    try {
        // Send staff notification email
        console.log('Starting email sending process...');
        
        const staffEmailResult = await sendEmail({
            to: 'tributestream@gmail.com',
            ...staffEmail
        }, fetch, 'staff');

        if (!staffEmailResult.success) {
            console.error('Staff email failed:', staffEmailResult.error);
            throw new Error(staffEmailResult.error);
        }

        // Send user welcome email
        const userEmailResult = await sendEmail({
            to: 'tributestream@gmail.com', // Testing email (will be user's email in production)
            ...userEmail
        }, fetch, 'user');

        if (!userEmailResult.success) {
            console.error('User welcome email failed:', userEmailResult.error);
            throw new Error(userEmailResult.error);
        }

        console.log('Both emails sent successfully');
        return { success: true };
    } catch (error) {
        console.error('Error in sendEmails:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to send emails' 
        };
    }
}

export const actions = {
    default: async ({ request, cookies, fetch }) => {
        let password = '';
        let userId = '';
        let token = '';

        try {
            password = generatePassword();
            console.log('Starting form submission process...');

            const formData = await request.formData();
            const data = {
                directorFirstName: formData.get('director-first-name')?.toString() || '',
                directorLastName: formData.get('director-last-name')?.toString() || '',
                familyMemberFirstName: formData.get('family-member-first-name')?.toString() || '',
                familyMemberLastName: formData.get('family-member-last-name')?.toString() || '',
                familyMemberDOB: formData.get('family-member-dob')?.toString() || '',
                deceasedFirstName: formData.get('deceased-first-name')?.toString() || '',
                deceasedLastName: formData.get('deceased-last-name')?.toString() || '',
                deceasedDOB: formData.get('deceased-dob')?.toString() || '',
                deceasedDOP: formData.get('deceased-dop')?.toString() || '',
                email: formData.get('email-address')?.toString() || '',
                phone: formData.get('phone-number')?.toString() || '',
                locationName: formData.get('location-name')?.toString() || '',
                locationAddress: formData.get('location-address')?.toString() || '',
                memorialTime: formData.get('memorial-time')?.toString() || '',
                memorialDate: formData.get('memorial-date')?.toString() || '',
            };

            if (!data.email || !data.directorFirstName || !data.directorLastName || !data.locationName) {
                return fail(400, { error: true, message: 'Required fields are missing.' });
            }

            console.log('Registering user...');
            // Register user
            const registerResponse = await fetch(`/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.email,
                    email: data.email,
                    password: password
                })
            });

            const registerResult = await registerResponse.json();
            
            if (!registerResponse.ok || registerResult.error) {
                console.error('Registration failed:', registerResult);
                
                // Handle specific WordPress registration errors
                let errorMessage = registerResult.message || 'Registration failed';
                
                if (errorMessage.includes('username is already registered') || 
                    errorMessage.includes('email address is already registered')) {
                    errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
                } else if (errorMessage.includes('Missing required fields')) {
                    errorMessage = 'Please fill in all required fields.';
                } else if (errorMessage.includes('Invalid username')) {
                    errorMessage = 'The email address contains invalid characters. Please use a different email address.';
                } else if (errorMessage.includes('Invalid email address')) {
                    errorMessage = 'Please enter a valid email address.';
                }
                
                return fail(registerResponse.status, { 
                    error: true, 
                    message: errorMessage,
                    code: registerResult.code || 'registration_failed'
                });
            }

            userId = registerResult.user_id.toString();
            console.log('User registered successfully. User ID:', userId);

            console.log('Authenticating user...');
            // Authenticate user
            const authResponse = await fetch(`/api/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.email,
                    password: password
                })
            });

            const authResult = await authResponse.json();
            
            if (!authResponse.ok || authResult.error) {
                console.error('Authentication failed:', authResult);
                return fail(authResponse.status, { 
                    error: true, 
                    message: authResult.message || 'Authentication failed' 
                });
            }

            token = authResult.token;
            console.log('Authentication successful. Token received.');

            // Store tokens in cookies with explicit options
            cookies.set('jwt_token', token, { 
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });

            cookies.set('user_id', userId, {
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });

            console.log('Cookies set successfully');

            // Format data for email template
            const memorialData: MemorialFormData = {
                director: {
                    firstName: data.directorFirstName,
                    lastName: data.directorLastName
                },
                familyMember: {
                    firstName: data.familyMemberFirstName,
                    lastName: data.familyMemberLastName,
                    dob: data.familyMemberDOB
                },
                deceased: {
                    firstName: data.deceasedFirstName,
                    lastName: data.deceasedLastName,
                    dob: data.deceasedDOB,
                    dop: data.deceasedDOP
                },
                contact: {
                    email: data.email,
                    phone: data.phone
                },
                memorial: {
                    locationName: data.locationName,
                    locationAddress: data.locationAddress,
                    time: data.memorialTime,
                    date: data.memorialDate
                }
            };

            console.log('Saving user metadata...');
            // Save user metadata
            const metaPayload = {
                user_id: userId,
                meta_key: 'memorial_form_data',
                meta_value: JSON.stringify(memorialData)
            };

            const metaResponse = await fetch(`/api/user-meta`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(metaPayload)
            });

            const metaResult = await metaResponse.json();
            
            if (!metaResponse.ok || metaResult.error) {
                console.error('Failed to save metadata:', metaResult);
                return fail(metaResponse.status, { 
                    error: true, 
                    message: metaResult.message || 'Failed to save user metadata' 
                });
            }

            console.log('Metadata saved successfully');

            console.log('Creating tribute...');
            // Create tribute
            const slug = generateSlug(data.deceasedFirstName, data.deceasedLastName);
            const tributePayload = {
                loved_one_name: `${data.deceasedFirstName} ${data.deceasedLastName}`,
                slug,
                user_id: userId,
                phone_number: data.phone
            };

            const tributeResponse = await fetch(`/api/tributes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(tributePayload)
            });

            const tributeResult = await tributeResponse.json();
            
            if (!tributeResponse.ok || tributeResult.error) {
                console.error('Failed to create tribute:', tributeResult);
                return fail(tributeResponse.status, { 
                    error: true, 
                    message: tributeResult.message || 'Failed to create tribute' 
                });
            }

            console.log('Tribute created successfully');
            console.log('Generating email content...');
            
            // Generate email content
            const staffEmail = generateMemorialRequestEmail(memorialData);
            const userEmail = generateWelcomeEmail({
                firstName: data.familyMemberFirstName,
                lastName: data.familyMemberLastName,
                email: data.email,
                password,
                userId,
                token
            });

            console.log('Sending emails...');
            
            // Send both emails
            const emailResult = await sendEmails(staffEmail, userEmail, fetch);
            
            if (!emailResult.success) {
                console.error('Failed to send emails:', emailResult.error);
                // Return the error but don't fail the form submission
                return {
                    error: true,
                    message: 'Form submitted successfully, but there was an issue sending confirmation emails. Our team will contact you shortly.',
                    emailError: emailResult.error
                };
            }

            console.log('Emails sent successfully');

        } catch (error) {
            console.error('Error processing form:', error);
            return fail(500, { 
                error: true, 
                message: error instanceof Error ? error.message : 'An unexpected error occurred.' 
            });
        }

        // Verify cookies are set
        const jwtCookie = cookies.get('jwt_token');
        const userIdCookie = cookies.get('user_id');

        if (!jwtCookie || !userIdCookie) {
            console.error('Cookie verification failed:', {
                hasJwtCookie: !!jwtCookie,
                hasUserIdCookie: !!userIdCookie
            });
            return fail(500, {
                error: true,
                message: 'Authentication failed after form submission'
            });
        }

        // Get user role using the userId
        console.log('Fetching user role...');
        try {
            const roleResponse = await fetch(`/api/getRole/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const roleResult = await roleResponse.json();

            if (!roleResponse.ok || roleResult.error) {
                console.error('Failed to fetch user role:', roleResult);
                return fail(roleResponse.status, {
                    error: true,
                    message: roleResult.message || 'Failed to fetch user role'
                });
            }

            console.log('User role fetched successfully:', roleResult.role);

            // Store the role in a cookie for future use
            cookies.set('user_role', roleResult.role, {
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });

        } catch (error) {
            console.error('Error fetching user role:', error);
            return fail(500, {
                error: true,
                message: error instanceof Error ? error.message : 'Failed to fetch user role'
            });
        }

        console.log('Form submission completed successfully. Redirecting to confirmation page...');
        // Throw redirect after successful form submission and cookie verification
        throw redirect(303, '/fd-form/confirmation');
    }
} satisfies Actions;
