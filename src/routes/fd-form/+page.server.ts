import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, ActionFailure } from '@sveltejs/kit';

interface FormData {
  lovedOneName: string;
  familyContactName: string;
  familyContactPhone: string;
  familyContactEmail: string;
  funeralDirectorName: string;
  funeralHome: string;
  memorialLocation: string;
  memorialDate: string;
}

interface ApiError {
  error?: {
    message?: string;
    details?: {
      errors?: Array<{message: string}>;
    };
  };
}
import crypto from 'crypto';

// API constants
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

// Helper functions
/**
 * Gets the full Strapi URL for API endpoints
 */
function getStrapiUrl(path: string): string {
  return `${STRAPI_URL}${path}`;
}

/**
 * Register a new user with Strapi
 */
async function registerUser(username: string, email: string, password: string): Promise<any> {
  console.log('🔐 Registering new user:', { username, email });
  
  try {
    const response = await fetch(getStrapiUrl('/api/auth/local/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        email,
        password
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Registration failed:', errorData);
      
      // Extract and format error message from Strapi
      let errorMessage = 'Registration failed';
      
      if (errorData.error) {
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData.error.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.error.details?.errors?.length > 0) {
          errorMessage = errorData.error.details.errors
            .map((err: any) => err.message)
            .join('. ');
        }
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('✅ Registration successful for:', data.user.email);
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error; // Re-throw the already formatted error
    }
    throw new Error('An unexpected error occurred during registration');
  }
}

/**
 * Login user with Strapi
 */
async function loginUser(identifier: string, password: string): Promise<any> {
  console.log('🔑 Logging in user:', { identifier });
  
  try {
    const response = await fetch(getStrapiUrl('/api/auth/local'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier,
        password
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Login failed:', errorData);
      
      // Extract and format error message from Strapi
      let errorMessage = 'Login failed';
      
      if (errorData.error) {
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('✅ Login successful for:', data.user.email);
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error; // Re-throw the already formatted error
    }
    throw new Error('An unexpected error occurred during login');
  }
}

/**
 * Generate a secure random password of specified length
 */
function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  
  // Create a cryptographically secure random string
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    // Use modulo bias-free selection from charset
    const index = randomBytes[i] % charset.length;
    password += charset[index];
  }
  
  console.log('🔑 Generated secure password');
  return password;
}

/**
 * Create a slug from text (loved one's name)
 */
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Create a tribute in Strapi
 */
async function createTribute(data: any, token: string): Promise<any> {
  console.log('📝 Creating tribute for:', data.lovedOnesFullName);
  
  try {
    const response = await fetch(getStrapiUrl('/api/tributes'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ data })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Tribute creation failed:', errorData);
      throw new Error(errorData.error?.message || 'Failed to create tribute');
    }
    
    const result = await response.json();
    console.log('✅ Tribute created successfully:', result.data.id);
    return result.data;
  } catch (error) {
    console.error('❌ Tribute creation error:', error);
    throw error;
  }
}

/**
 * Form actions for the fd-form page
 */
export const actions: Actions = {
  default: async ({ request, cookies }): Promise<ActionFailure<{ errors: Record<string, string>; data: Partial<FormData> }> | { success: true }> => {
    console.log('🔄 Processing funeral director form submission');
    
    // 1. Extract form data
    const formData = await request.formData();
    const formValues: FormData = {
      lovedOneName: formData.get('lovedOneName')?.toString() || '',
      familyContactName: formData.get('familyContactName')?.toString() || '',
      familyContactPhone: formData.get('familyContactPhone')?.toString() || '',
      familyContactEmail: formData.get('familyContactEmail')?.toString() || '',
      funeralDirectorName: formData.get('funeralDirectorName')?.toString() || '',
      funeralHome: formData.get('funeralHome')?.toString() || '',
      memorialLocation: formData.get('memorialLocation')?.toString() || '',
      memorialDate: formData.get('memorialDate')?.toString() || ''
    };
    
    console.log('📋 Received form data:', {
      lovedOneName: formValues.lovedOneName,
      familyContactName: formValues.familyContactName,
      familyContactPhone: formValues.familyContactPhone,
      familyContactEmail: formValues.familyContactEmail
    });

    // 2. Validate required fields
    const errors: Record<string, string> = {};
    
    if (!formValues.lovedOneName) errors.lovedOneName = 'Loved one\'s name is required';
    if (!formValues.familyContactName) errors.familyContactName = 'Family contact name is required';
    if (!formValues.familyContactEmail) errors.familyContactEmail = 'Family contact email is required';
    if (!formValues.familyContactPhone) errors.familyContactPhone = 'Family contact phone is required';
    if (!formValues.funeralDirectorName) errors.funeralDirectorName = 'Funeral director name is required';
    if (!formValues.funeralHome) errors.funeralHome = 'Funeral home is required';
    if (!formValues.memorialLocation) errors.memorialLocation = 'Memorial location is required';
    if (!formValues.memorialDate) errors.memorialDate = 'Memorial date is required';
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formValues.familyContactEmail && !emailRegex.test(formValues.familyContactEmail)) {
      errors.familyContactEmail = 'Please provide a valid email address';
    }
    
    // Validate phone format
    const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    if (formValues.familyContactPhone && !phoneRegex.test(formValues.familyContactPhone)) {
      errors.familyContactPhone = 'Please provide a valid phone number';
    }
    
    // If validation fails, return errors
    if (Object.keys(errors).length > 0) {
      console.log('❌ Validation failed with errors:', errors);
      return fail(400, { errors, data: formValues });
    }
    
    try {
      // 3. Generate a random password for the new user
      const password = generateRandomPassword();
      
      // 4. Register the new user (using email as username)
      console.log('👤 Creating new user with email:', formValues.familyContactEmail);
      const registrationResult = await registerUser(
        formValues.familyContactEmail, // username
        formValues.familyContactEmail, // email
        password
      );
      
      // 5. Generate slug from loved one's name
      const slug = createSlug(formValues.lovedOneName);
      console.log('🔗 Generated slug:', slug);
      
      // 6. Create a tribute entry
      const tributeData = {
        lovedOnesFullName: formValues.lovedOneName,
        slug: slug,
        users_permissions_user: registrationResult.user.id,
        events: [
          {
            eventName: 'Memorial Service',
            eventLocation: formValues.memorialLocation,
            eventDate: formValues.memorialDate
          }
        ],
        // Additional fields could be added here
        paymentComplete: false // Default to false until payment is processed
      };
      
      const tribute = await createTribute(tributeData, registrationResult.jwt);
      console.log('🏆 Created tribute with ID:', tribute.id);
      
      // 7. Store the JWT in a cookie for authentication
      cookies.set('jwt', registrationResult.jwt, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      
      console.log('🔐 User logged in automatically');
      
      // 8. Send email to family contact with their login credentials (implement later)
      // This would need to be handled by a separate service
      console.log('📧 Would send email to family with password:', password);
      
      // 9. Redirect to the tribute page
      console.log('🚀 Redirecting to tribute page:', `/tribute/${slug}`);
      throw redirect(303, `/tribute/${slug}`);
      
    } catch (err) {
      console.error('❌ Error processing form:', err);
      
      // Handle specific error cases
      if (err instanceof Error) {
        // Check if it's a redirect (this is expected behavior, not an error)
        if ((err as any).status === 303) {
          throw err; // Re-throw redirect
        }
        
        return fail(500, {
          errors: { form: err.message },
          data: formValues
        });
      }
      
      return fail(500, {
        errors: { form: 'An unexpected error occurred' },
        data: formValues
      });
    }
  }
};