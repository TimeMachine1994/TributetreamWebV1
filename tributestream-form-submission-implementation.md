# Tributestream Seamless Form Submission Implementation Guide

## Overview

This guide outlines the implementation process for creating a seamless form submission system in Tributestream that handles user authentication and tribute creation in one unified flow.

**Key Requirements:**
1. Generate secure random passwords
2. Register users with validation
3. Authenticate users and establish sessions
4. Store JWT tokens securely
5. Submit tribute data with validation
6. Redirect to the new tribute page

## System Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant FDForm as fd-form/+page.svelte
    participant FormAction as fd-form/+page.server.ts
    participant RegisterAPI as api/auth/register/+server.ts
    participant AuthAPI as api/auth/+server.ts
    participant WPBackend as WordPress Backend
    participant TributePage as tribute-page/+page.svelte
    
    User->>FDForm: Submit Form
    FDForm->>FormAction: POST form data
    FormAction->>FormAction: Generate secure password
    FormAction->>RegisterAPI: Register user
    RegisterAPI->>WPBackend: Create WordPress user
    WPBackend-->>RegisterAPI: User created
    RegisterAPI-->>FormAction: Registration success
    FormAction->>AuthAPI: Authenticate user
    AuthAPI->>WPBackend: Request JWT token
    WPBackend-->>AuthAPI: Return JWT token
    AuthAPI-->>FormAction: Authentication successful
    FormAction->>FormAction: Store JWT in cookies
    FormAction->>WPBackend: Submit metadata & create tribute
    FormAction->>TributePage: Redirect to tribute page
```

## Implementation Steps

### 1. Create Registration API Endpoint

**File:** `src/routes/api/auth/register/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, fetch }) => {
    console.log('🚀 [Register API] POST request received.');
    
    // Parse and validate input
    try {
        const requestBody = await request.json();
        const { username, email, password } = requestBody;
        
        // Basic validation
        if (!username || !email || !password) {
            return json({ 
                success: false,
                message: 'Username, email, and password are required' 
            }, { status: 400 });
        }
        
        if (!isValidEmail(email)) {
            return json({ 
                success: false,
                message: 'Invalid email format' 
            }, { status: 400 });
        }
        
        // Forward to WordPress registration endpoint
        const response = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('❌ [Register API] Registration failed:', data);
            return json({ 
                success: false,
                message: data.message || 'Registration failed' 
            }, { status: response.status });
        }
        
        console.log('✅ [Register API] Registration successful');
        return json({
            success: true,
            user_id: data.user_id,
            user_email: data.user_email,
            user_display_name: data.user_display_name
        }, { status: 200 });
    } catch (error) {
        console.error('🚨 [Register API] Error:', error);
        return json({ 
            success: false,
            message: 'Internal server error' 
        }, { status: 500 });
    }
};

// Validation helper
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
```

### 2. Create Server Hooks for Authentication

**File:** `src/hooks.server.ts`

```typescript
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // Get JWT token from cookies
    const jwt = event.cookies.get('jwt');
    
    if (jwt) {
        try {
            // Validate token with WordPress endpoint
            const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token/validate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwt}`
                }
            });
            
            if (response.ok) {
                // If token is valid, set authenticated status in locals
                event.locals.authenticated = true;
                event.locals.token = jwt;
                
                // Also set user_id if available
                const userId = event.cookies.get('user_id');
                if (userId) {
                    event.locals.user_id = userId;
                }
            } else {
                // If token validation fails, clear the cookies
                event.cookies.delete('jwt', { path: '/' });
                event.cookies.delete('user_id', { path: '/' });
            }
        } catch (error) {
            console.error('Error validating JWT token:', error);
        }
    }
    
    // Continue with the request
    return await resolve(event);
};
```

### 3. Create Form Validation Utility

**File:** `src/lib/utils/form-validation.ts`

```typescript
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export function validateFuneralDirectorForm(data: any): ValidationResult {
    const errors: string[] = [];
    
    // Required fields
    if (!data.email) errors.push('Email address is required');
    if (!data.directorFirstName) errors.push('Director\'s first name is required');
    if (!data.directorLastName) errors.push('Director\'s last name is required');
    if (!data.locationName) errors.push('Memorial location name is required');
    if (!data.deceasedFirstName) errors.push('Deceased\'s first name is required');
    if (!data.deceasedLastName) errors.push('Deceased\'s last name is required');
    
    // Email validation
    if (data.email && !isValidEmail(data.email)) {
        errors.push('Invalid email format');
    }
    
    // Phone validation (if provided)
    if (data.phone && !isValidPhone(data.phone)) {
        errors.push('Invalid phone number format');
    }
    
    // Date validations (if provided)
    if (data.deceasedDOB && !isValidDate(data.deceasedDOB)) {
        errors.push('Invalid deceased date of birth');
    }
    
    if (data.deceasedDOP && !isValidDate(data.deceasedDOP)) {
        errors.push('Invalid deceased date of passing');
    }
    
    if (data.memorialDate && !isValidDate(data.memorialDate)) {
        errors.push('Invalid memorial date');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[0-9\-\+\(\)\s]{7,20}$/;
    return phoneRegex.test(phone);
}

function isValidDate(date: string): boolean {
    const d = new Date(date);
    return !isNaN(d.getTime());
}
```

### 4. Update Form Server Action

**File:** `src/routes/fd-form/+page.server.ts`

```typescript
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { generateSecurePassword, setAuthCookies } from '$lib/utils/auth-helpers';
import { validateFuneralDirectorForm } from '$lib/utils/form-validation';

// Function to generate a slug from the deceased's name
function generateSlug(firstName: string, lastName: string): string {
    return `${firstName.trim().toLowerCase()}_${lastName.trim().toLowerCase()}`.replace(/\s+/g, '_');
}

export const actions = {
    default: async ({ request, fetch, cookies }) => {
        console.log('🚀 Starting fd-form action.');

        try {
            // Step 1: Parse form data
            console.log('📝 Parsing form data...');
            const formData = await request.formData();
            const data = parseFormData(formData);
            
            // Step 2: Validate form data
            console.log('🔍 Validating form data...');
            const validation = validateFuneralDirectorForm(data);
            if (!validation.isValid) {
                console.error('❌ Validation errors:', validation.errors);
                return fail(400, { 
                    error: true, 
                    message: validation.errors.join('. ') 
                });
            }
            
            // Step 3: Generate a secure random password
            console.log('🔐 Generating a secure password.');
            const password = generateSecurePassword(16);
            console.log('✅ Password generated successfully');
            
            // Step 4: Register the user
            console.log('🔄 Registering user...');
            const registerResponse = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.email,
                    email: data.email,
                    password: password
                })
            });

            const registerResult = await registerResponse.json();
            
            // Handle registration errors
            if (!registerResponse.ok) {
                console.error('❌ Registration failed:', registerResult);
                
                // Handle specific error scenarios
                if (registerResult.message?.includes('email already exists')) {
                    return fail(400, { 
                        error: true, 
                        message: 'An account with this email already exists. Please use a different email address.' 
                    });
                }
                
                return fail(registerResponse.status, { 
                    error: true, 
                    message: registerResult.message || 'Registration failed' 
                });
            }

            const userId = registerResult.user_id;
            console.log('✅ User registered with ID:', userId);

            // Step 5: Authenticate the user
            console.log('🔄 Authenticating user...');
            const authResponse = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: data.email,
                    password: password
                })
            });

            // Handle authentication errors
            if (!authResponse.ok) {
                const authError = await authResponse.json();
                console.error('❌ Authentication failed:', authError);
                return fail(authResponse.status, { 
                    error: true, 
                    message: authError.message || 'Authentication failed after registration' 
                });
            }

            const authResult = await authResponse.json();
            console.log('✅ User authenticated. JWT token received');

            // Step 6: Store the JWT token in cookies
            console.log('🔐 Storing authentication tokens...');
            cookies.set('jwt', authResult.token, { 
                httpOnly: true, 
                secure: true, 
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days 
            });
            
            cookies.set('user_id', userId, {
                httpOnly: true,
                secure: true,
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });

            // Step 7: Store user metadata
            console.log('📝 Writing user metadata...');
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
            
            const metaResponse = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/user-meta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authResult.token}`
                },
                body: JSON.stringify(metaPayload)
            });

            // Handle metadata errors
            if (!metaResponse.ok) {
                const metaError = await metaResponse.json();
                console.error('❌ Metadata write failed:', metaError);
                return fail(metaResponse.status, { 
                    error: true, 
                    message: metaError.message || 'Failed to save user metadata' 
                });
            }

            console.log('✅ Metadata written successfully.');

            // Step 8: Create the tribute record
            console.log('🚀 Creating tribute...');
            
            // Generate the slug
            const slug = generateSlug(data.deceasedFirstName, data.deceasedLastName);

            // Prepare the tribute payload
            const tributePayload = {
                loved_one_name: `${data.deceasedFirstName} ${data.deceasedLastName}`,
                slug,
                user_id: userId,
                phone_number: data.phone || '000-000-0000' // Ensure we have a phone number
            };
            
            console.log('📦 Sending tribute payload:', tributePayload);
            
            const tributeResponse = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/tributes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authResult.token}`
                },
                body: JSON.stringify(tributePayload)
            });
            
            // Handle tribute creation errors
            if (!tributeResponse.ok) {
                const tributeError = await tributeResponse.json();
                console.error('❌ Tribute creation failed:', tributeError);
                return fail(tributeResponse.status, { 
                    error: true, 
                    message: tributeError.message || 'Failed to create tribute' 
                });
            }
            
            const tributeResult = await tributeResponse.json();
            console.log('✅ Tribute created successfully:', tributeResult);
            
            // Optional: Send welcome email with credentials
            try {
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        to: data.email,
                        subject: 'Your Tributestream Account',
                        html: `
                            <h2>Welcome to Tributestream</h2>
                            <p>Your account has been created with the following credentials:</p>
                            <p><strong>Username:</strong> ${data.email}</p>
                            <p><strong>Password:</strong> ${password}</p>
                            <p>Your tribute page is now available at: https://tributestream.com/celebration-of-life-for-${slug}</p>
                        `
                    })
                });
            } catch (emailError) {
                console.warn('⚠️ Email notification failed, but process continues:', emailError);
            }
            
            // Step 9: Redirect to the newly created tribute page
            console.log('🔀 Redirecting to created tribute page...');
            throw redirect(303, `/celebration-of-life-for-${slug}`);
            
        } catch (error) {
            // Only handle errors that aren't already handled (like redirect)
            if (error instanceof Response) throw error;
            
            console.error('💥 Unexpected error:', error);
            return fail(500, { 
                error: true, 
                message: 'An unexpected error occurred. Please try again.' 
            });
        }
    }
} satisfies Actions;

// Helper function to parse form data
function parseFormData(formData: FormData) {
    return {
        directorFirstName: formData.get('director-first-name') as string,
        directorLastName: formData.get('director-last-name') as string,
        familyMemberFirstName: formData.get('family-member-first-name') as string,
        familyMemberLastName: formData.get('family-member-last-name') as string,
        familyMemberDOB: formData.get('family-member-dob') as string,
        deceasedFirstName: formData.get('deceased-first-name') as string,
        deceasedLastName: formData.get('deceased-last-name') as string,
        deceasedDOB: formData.get('deceased-dob') as string,
        deceasedDOP: formData.get('deceased-dop') as string,
        email: formData.get('email-address') as string,
        phone: formData.get('phone-number') as string,
        locationName: formData.get('location-name') as string,
        locationAddress: formData.get('location-address') as string,
        memorialTime: formData.get('memorial-time') as string,
        memorialDate: formData.get('memorial-date') as string,
    };
}
```

### 5. Add Tribute Page Data Loading

**File:** `src/routes/celebration-of-life-for-[slug]/+page.server.ts`

```typescript
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
    try {
        const slug = params.slug;
        
        if (!slug) {
            throw error(404, 'Tribute not found');
        }
        
        const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tribute/${slug}`);
        
        if (!response.ok) {
            throw error(response.status, 'Failed to load tribute');
        }
        
        const tribute = await response.json();
        
        return {
            tribute
        };
    } catch (err) {
        console.error('Error loading tribute:', err);
        throw error(500, 'Error loading tribute data');
    }
};
```

## Security Considerations

### Password Security

- **Implementation Details:**
  - Use `generateSecurePassword()` from `auth-helpers.ts` with 16+ characters
  - Include uppercase, lowercase, numbers, and special characters
  - Never log or display passwords except in welcome emails

### Token Storage

- **Implementation Details:**
  - Store JWT tokens in HTTP-only cookies:
    ```typescript
    cookies.set('jwt', token, { 
        httpOnly: true, 
        secure: true, 
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days 
    });
    ```
  - Validate tokens server-side in hooks.server.ts
  - Clear tokens on invalid/expired status

### Form Validation

- **Implementation Details:**
  - Use `validateFuneralDirectorForm()` from form-validation.ts
  - Validate inputs before API calls
  - Return specific error messages for each validation failure

## Testing Checklist

- [ ] Registration API works with valid credentials
- [ ] Registration API handles duplicate emails properly
- [ ] Password generation creates strong, random passwords
- [ ] JWT tokens are properly stored and retrieved
- [ ] Form validation catches all invalid inputs
- [ ] Tribute creation works with valid data
- [ ] Redirect to tribute page works correctly
- [ ] Error handling provides useful messages to users

## Implementation Timeline

1. **Day 1-2:** Registration API endpoint and form validation
2. **Day 3-4:** Auth hooks and token management
3. **Day 5-7:** Form submission refactoring
4. **Day 8:** Tribute page integration
5. **Day 9-10:** Testing and documentation

## API Reference

### Registration API

- **Endpoint:** `/api/auth/register`
- **Method:** POST
- **Body:**
  ```json
  {
    "username": "user@example.com",
    "email": "user@example.com",
    "password": "securePassword123!"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "user_id": "123",
    "user_email": "user@example.com",
    "user_display_name": "user"
  }
  ```

### Authentication API

- **Endpoint:** `/api/auth`
- **Method:** POST
- **Body:**
  ```json
  {
    "username": "user@example.com",
    "password": "securePassword123!"
  }
  ```
- **Success Response:**
  ```json
  {
    "token": "jwt_token_string",
    "user_id": "123",
    "user_display_name": "User Name",
    "user_email": "user@example.com"
  }
  ```

### WordPress User Meta API

- **Endpoint:** `https://wp.tributestream.com/wp-json/tributestream/v1/user-meta`
- **Method:** POST
- **Headers:** `Authorization: Bearer jwt_token`
- **Body:**
  ```json
  {
    "user_id": "123",
    "meta_key": "memorial_form_data",
    "meta_value": "{\"director\":{...},\"deceased\":{...}}"
  }
  ```

### WordPress Tribute API

- **Endpoint:** `https://wp.tributestream.com/wp-json/tributestream/v1/tributes`
- **Method:** POST
- **Headers:** `Authorization: Bearer jwt_token`
- **Body:**
  ```json
  {
    "loved_one_name": "John Doe",
    "slug": "john_doe",
    "user_id": "123",
    "phone_number": "555-123-4567"
  }