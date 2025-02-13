import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { RegisterData } from '$lib/types/api';

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

export const actions = {
    default: async ({ request, cookies, fetch }) => {
        let password = '';
        try {
            password = generatePassword();

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

            const userId = registerResult.user_id;

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

            // Store tokens in cookies
            cookies.set('jwt_token', authResult.token, { 
                httpOnly: true, 
                secure: true, 
                path: '/',
                sameSite: 'strict'
            });
            cookies.set('user_id', userId.toString(), {
                httpOnly: true,
                secure: true,
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });

            // Save user metadata
            const metaPayload = {
                user_id: userId,
                meta_key: 'memorial_form_data',
                meta_value: JSON.stringify({
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
                })
            };

            const metaResponse = await fetch(`/api/user-meta`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authResult.token}`
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

            // Create tribute
            const slug = generateSlug(data.deceasedFirstName, data.deceasedLastName);
            const tributePayload = {
                loved_one_name: `${data.deceasedFirstName} ${data.deceasedLastName}`,
                slug,
                user_id: userId,
                phone_number: data.phone // Add required phone_number field
            };

            console.log('Creating tribute with payload:', tributePayload);

            const tributeResponse = await fetch(`/api/tributes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authResult.token}`
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

        } catch (error) {
            console.error('Error processing form:', error);
            return fail(500, { 
                error: true, 
                message: error instanceof Error ? error.message : 'An unexpected error occurred.' 
            });
        }

        // Verify cookies are set
        if (!cookies.get('jwt_token') || !cookies.get('user_id')) {
            return fail(500, {
                error: true,
                message: 'Authentication failed after form submission'
            });
        }

        // Throw redirect after successful form submission and cookie verification
        throw redirect(303, '/fd-form/confirmation');
    }
} satisfies Actions;
