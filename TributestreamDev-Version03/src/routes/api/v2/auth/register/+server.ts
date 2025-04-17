/**
 * User registration API endpoint for the API v2
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { 
  ApiErrors, 
  formatResponse, 
  validateRequired, 
  validateEmail,
  validatePassword
} from '../../utils';
import { createWpApiClient } from '../../utils/wp-api-client';
import { getRoleForUserType } from '../../utils/auth-utils';
import type { UserRegistrationRequest, UserRegistrationResponse } from '../../types/users';

/**
 * POST handler for user registration
 * 
 * @route POST /api/v2/auth/register
 * @param request The request object
 * @returns Response with registered user data
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // Parse request body
    const data = await request.json() as UserRegistrationRequest;
    
    // Validate required fields
    validateRequired(data, ['username', 'email', 'password']);
    
    // Validate email format
    validateEmail(data.email);
    
    // Validate password strength
    validatePassword(data.password, 8);
    
    // Create WordPress API client
    const wpClient = createWpApiClient();
    
    // Determine user role based on user_type
    const userType = data.user_type || 'guest';
    const role = data.role || getRoleForUserType(userType);
    
    // Register user with WordPress
    const userData = await wpClient.post('wp/v2/users', {
      username: data.username,
      email: data.email,
      password: data.password,
      name: data.name || data.username,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      roles: [role],
      meta: {
        user_type: userType
      }
    }, false);
    
    // Send welcome email if requested
    let emailSent = false;
    if (data.send_welcome_email !== false) {
      try {
        await wpClient.post('tributestream/v1/send-welcome-email', {
          user_id: userData.id,
          email: data.email,
          name: data.name || data.username
        }, false);
        
        emailSent = true;
      } catch (error) {
        console.error('Failed to send welcome email:', error);
        // Continue with registration even if email fails
      }
    }
    
    // Format user data for response
    const user = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      name: userData.name,
      display_name: userData.name,
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      roles: [role],
      user_type: userType,
      registered_date: userData.registered_date || new Date().toISOString()
    };
    
    // Return success response
    return formatResponse<UserRegistrationResponse['data']>({
      user,
      email_sent: emailSent
    }, 201);
  } catch (error) {
    // Handle specific WordPress errors
    if (error instanceof Error) {
      if (error.message.includes('existing_user_login')) {
        throw ApiErrors.conflict('Username already exists');
      }
      
      if (error.message.includes('existing_user_email')) {
        throw ApiErrors.conflict('Email address already exists');
      }
    }
    
    // Re-throw other errors
    throw error;
  }
};