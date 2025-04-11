/**
 * WordPress User Registration Service
 * Handles user registration with the WordPress API via the existing registration endpoint
 */

interface RegistrationResult {
    success: boolean;
    message: string;
    isDuplicate?: boolean; // Flag for specific duplicate error
    userId?: number; // WordPress User ID if successful
}

interface UserData {
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string; // Optional, will be generated if not provided
    password?: string; // Optional, will be generated if not provided
}

/**
 * Register a new user in WordPress
 * 
 * @param userData User data to register
 * @returns Promise resolving to a RegistrationResult
 */
export async function registerWordPressUser(userData: UserData): Promise<RegistrationResult> {
    console.log(`🏁 Attempting to register user in WordPress: ${userData.email}`);

    // Generate username if not provided (email prefix + random string)
    const username = userData.username || 
        userData.email.split('@')[0] + Math.random().toString(36).substring(2, 7);
    
    // Generate random password if not provided
    const password = userData.password || 
        Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);

    try {
        // Use the existing registration endpoint
        const response = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email: userData.email,
                password,
                firstName: userData.firstName || '',
                lastName: userData.lastName || ''
            })
        });

        const responseData = await response.json();

        if (response.ok) {
            console.log(`✅ WordPress user registration successful for ${userData.email}`);
            return {
                success: true,
                message: 'User registered successfully.',
                userId: responseData.user_id
            };
        } else {
            console.warn(`❌ WordPress user registration failed for ${userData.email}. Status: ${response.status}`);
            
            // Check for specific error messages that indicate duplicate user
            if (responseData.message?.includes('email already exists') || 
                responseData.message?.includes('existing_user_email')) {
                    console.log('Email exists detected, setting isDuplicate to true');
                return {
                    success: false,
                    message: `User with email ${userData.email} already exists.`,
                    isDuplicate: true
                    
                };
                
            }
            
            if (responseData.message?.includes('username already exists') || 
                responseData.message?.includes('existing_user_login')) {
                return {
                    success: false,
                    message: `User with username derived from ${userData.email} already exists.`,
                    isDuplicate: true
                };
            }
            
            // Handle other errors
            return {
                success: false,
                message: responseData.message || 'Unknown registration error'
            };
        }
    } catch (error: any) {
        console.error(`💥 Error during WordPress user registration for ${userData.email}:`, error);
        return {
            success: false,
            message: `Registration failed due to error: ${error.message}`
        };
    }
}