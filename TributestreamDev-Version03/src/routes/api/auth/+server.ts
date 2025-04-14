// src/routes/api/auth/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setAuthCookie, formatUserData } from '$lib/utils/cookie-auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
    console.log('🚀 [Auth API] POST request received.');
  
    // Step 1: Parse incoming JSON request
    let username, password;
    try {
        const requestBody = await request.json();
        username = requestBody.username;
        password = requestBody.password;
  
        console.log('📝 [Auth API] Parsed request JSON:');
        console.log('   Username:', username);
        console.log('   Password:', password ? '********' : undefined); // Mask password in logs
    } catch (error) {
        console.error('❌ [Auth API] Error parsing request JSON:', error);
        return json({ message: 'Invalid request payload' }, { status: 400 });
    }
  
    // Step 2: Validate credentials presence
    if (!username || !password) {
        console.warn('⚠️ [Auth API] Missing username or password.');
        return json({ message: 'Username and password are required' }, { status: 400 });
    }
  
    // Step 3: Make request to WordPress JWT endpoint
    console.log('🔄 [Auth API] Sending request to WordPress JWT endpoint...');
    try {
        const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
  
        console.log('🛬 [Auth API] Received response from WordPress:');
        console.log('   Status Code:', response.status);
  
        // Step 4: Parse WordPress response
        const data = await response.json();
        console.log('📝 [Auth API] Parsed response JSON from WordPress:');
        console.log('   Response Data:', JSON.stringify(data, null, 2).substring(0, 500) + '...'); // Truncate large objects
        
        // Log any initial role info if present
        if (data.roles) {
            console.log('   Initial User Roles:', data.roles);
        }
        
        if (data.capabilities) {
            console.log('   Initial User Capabilities:', Object.keys(data.capabilities).join(', '));
        }
  
        // Step 5: Handle non-OK responses
        if (!response.ok) {
            console.error('❌ [Auth API] WordPress returned an error:');
            console.error('   Message:', data.message);
            return json({ message: data.message || 'Authentication failed' }, { status: response.status });
        }
        
        // Step 6: Get detailed user role information from WordPress REST API
        console.log('🔄 [Auth API] Fetching detailed user information from WordPress...');
        let detailedUserData = data;
        
        try {
            // Make request to the WordPress REST API to get user details including roles
            console.log('🔒 [Auth API] Making request to wp/v2/users/me endpoint for role information...');
            const userResponse = await fetch('https://wp.tributestream.com/wp-json/wp/v2/users/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (userResponse.ok) {
                const userData = await userResponse.json();
                console.log('✅ [Auth API] Received detailed user data:');
                
                // Enhanced role extraction and logging
                if (userData.roles) {
                    // Normalize roles to array format regardless of how WordPress returns them
                    const roleArray = Array.isArray(userData.roles)
                        ? userData.roles
                        : typeof userData.roles === 'object'
                            ? Object.keys(userData.roles)
                            : typeof userData.roles === 'string'
                                ? userData.roles.split(',').map((r: string) => r.trim())
                                : [];
                                
                    console.log('   User Roles:', roleArray.join(', '));
                    
                    // Store normalized roles for later use
                    userData.normalizedRoles = roleArray;
                    
                    // Identify primary role (typically the first one, most important)
                    const primaryRole = roleArray.length > 0 ? roleArray[0] : null;
                    if (primaryRole) {
                        console.log('   Primary User Role:', primaryRole);
                        userData.primaryRole = primaryRole;
                    }
                } else {
                    console.warn('⚠️ [Auth API] No roles found in user data response');
                    userData.normalizedRoles = [];
                }
                
                // Extract and normalize capabilities
                const userCapabilities = userData.capabilities || {};
                const activeCapabilities = Object.keys(userCapabilities)
                    .filter(key => userCapabilities[key]);
                
                if (activeCapabilities.length > 0) {
                    console.log('   User Capabilities:', activeCapabilities.join(', '));
                }
                
                // Merge the detailed user data with the JWT response data
                detailedUserData = {
                    ...data,
                    roles: userData.normalizedRoles || [],
                    primaryRole: userData.primaryRole || null,
                    rawRoles: userData.roles, // Keep original format for debugging
                    capabilities: userData.capabilities || {},
                    // Add additional user metadata if available
                    user_id: userData.id || data.user_id,
                    display_name: userData.name || data.user_display_name,
                    email: userData.email || data.user_email
                };
                
                console.log('🔒 [Auth API] Role-based information successfully retrieved and merged.');
            } else {
                // Handle non-200 responses with detailed error logging
                let errorMessage;
                try {
                    const errorData = await userResponse.json();
                    errorMessage = errorData.message || `HTTP Error ${userResponse.status}`;
                } catch {
                    // No variable needed for catch clause since we don't use it
                    errorMessage = await userResponse.text() || `HTTP Error ${userResponse.status}`;
                }
                
                console.warn('⚠️ [Auth API] Could not fetch detailed user data:', userResponse.status);
                console.warn('   Error:', errorMessage);
                console.warn('   Using fallback role data from JWT endpoint.');
            }
        } catch (error) {
            // Handle network errors or other exceptions
            console.error('⚠️ [Auth API] Error fetching detailed user data:', error);
            console.log('   Continuing with limited user role data from JWT endpoint.');
            
            // Ensure we have at least empty role/capability arrays in case of error
            detailedUserData = {
                ...data,
                roles: data.roles || [],
                primaryRole: null,
                capabilities: data.capabilities || {}
            };
            
            console.warn('⚠️ [Auth API] Unable to retrieve detailed role information - using default values');
        }
  
        // Step 7: Set auth cookies and return successful response with role information
        console.log('✅ [Auth API] Authentication successful. Processing user data...');
        
        // Format user data with enhanced role information
        if (detailedUserData.roles) {
            if (Array.isArray(detailedUserData.roles) && detailedUserData.roles.length > 0) {
                console.log('   Available User Roles:', detailedUserData.roles.join(', '));
            } else if (typeof detailedUserData.roles === 'object') {
                console.log('   Available User Roles:', Object.keys(detailedUserData.roles).join(', '));
            } else if (typeof detailedUserData.roles === 'string') {
                console.log('   Available User Roles:', detailedUserData.roles);
            } else {
                console.warn('⚠️ [Auth API] Roles available but in an unexpected format');
            }
        } else {
            console.warn('⚠️ [Auth API] No roles available in detailed user data');
        }
        
        // Format the user data for cookie storage and response
        const userData = formatUserData(detailedUserData);
        
        if (userData.roles && userData.roles.length > 0) {
            console.log('   Final User Roles:', userData.roles.join(', '));
        } else {
            console.warn('⚠️ [Auth API] No roles available in final user data');
        }
        
        // Set auth cookies
        setAuthCookie(cookies, data.token, userData);
        
        // Return enhanced success response with explicit role information
        return json({
            success: true,
            user: {
                ...userData,
                // Explicitly include these for clarity in the response
                id: userData.id,
                name: userData.name,
                email: userData.email,
                display_name: userData.display_name
            },
            // Include enhanced user role and capabilities in the response
            auth: {
                roles: userData.roles || [],
                capabilities: userData.capabilities || {},
                primary_role: userData.primaryRole || (userData.roles && userData.roles.length > 0 ? userData.roles[0] : null),
                role_based_access: userData.roles && userData.roles.length > 0
            }
        }, { status: 200 });
    } catch (error) {
        console.error('🚨 [Auth API] Error occurred while authenticating with WordPress:', error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
}