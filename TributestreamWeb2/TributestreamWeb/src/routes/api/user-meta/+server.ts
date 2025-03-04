import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { masterSchema } from '$lib/schemas/masterSchema';
import type { z } from 'zod';

// Define TypeScript interfaces for our data structure
interface DirectorInfo {
    firstName?: string;
    lastName?: string;
    funeralHomeName?: string;
    funeralHomeAddress?: string;
}

interface LovedOneInfo {
    fullName?: string;
    dateOfBirth?: string;
    dateOfPassing?: string;
}

interface UserInfo {
    fullName?: string;
    emailAddress?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
}

interface MemorialLocation {
    name: string;
    address: string;
}

interface MemorialInfo {
    locations?: MemorialLocation[];
    startTime?: string;
    date?: string;
}

interface LiveStreamInfo {
    duration?: string;
    date?: string;
    startTime?: string;
}

interface PackageInfo {
    selection?: string;
    priceTotal?: number;
}

interface BillingInfo {
    firstName?: string;
    lastName?: string;
    address?: string;
    creditCardDetails?: any;
    isPaymentComplete?: boolean;
}

// Define the master data structure
interface MasterData {
    directorInfo: DirectorInfo;
    lovedOneInfo: LovedOneInfo;
    userInfo: UserInfo;
    memorialInfo: MemorialInfo;
    liveStreamInfo: LiveStreamInfo;
    packageInfo: PackageInfo;
    billingInfo: BillingInfo;
}

// Use MasterData as our schema type
type MasterSchemaType = MasterData;

// Define WordPress response interface
interface WPMetaEntry {
    meta_id: number;
    user_id: number;
    meta_key: string;
    meta_value: string;
}

/**
 * Helper function to create a master store compatible data structure
 */
function createMasterStoreData(): MasterSchemaType {
    return {
        directorInfo: {},
        lovedOneInfo: {},
        userInfo: {},
        memorialInfo: { locations: [{ name: '', address: '' }] },
        liveStreamInfo: {},
        packageInfo: { priceTotal: 0 },
        billingInfo: { isPaymentComplete: false }
    };
}

/**
 * Helper function to update a master store compatible data structure
 */
function updateMasterData(masterData: MasterSchemaType, newData: Partial<MasterSchemaType>): MasterSchemaType {
    // Create a copy of the master data
    const updatedMasterData = { ...masterData };
    
    // Update each section with new data
    if (newData.directorInfo) updatedMasterData.directorInfo = { ...updatedMasterData.directorInfo, ...newData.directorInfo };
    if (newData.lovedOneInfo) updatedMasterData.lovedOneInfo = { ...updatedMasterData.lovedOneInfo, ...newData.lovedOneInfo };
    if (newData.userInfo) updatedMasterData.userInfo = { ...updatedMasterData.userInfo, ...newData.userInfo };
    
    if (newData.memorialInfo) {
        if (newData.memorialInfo.locations) {
            updatedMasterData.memorialInfo = {
                ...updatedMasterData.memorialInfo,
                ...newData.memorialInfo
            };
        } else {
            updatedMasterData.memorialInfo = {
                ...updatedMasterData.memorialInfo,
                ...newData.memorialInfo
            };
        }
    }
    
    if (newData.liveStreamInfo) updatedMasterData.liveStreamInfo = { ...updatedMasterData.liveStreamInfo, ...newData.liveStreamInfo };
    if (newData.packageInfo) updatedMasterData.packageInfo = { ...updatedMasterData.packageInfo, ...newData.packageInfo };
    if (newData.billingInfo) updatedMasterData.billingInfo = { ...updatedMasterData.billingInfo, ...newData.billingInfo };
    
    return updatedMasterData;
}

// Server-side instance of our master data
let serverMasterData: MasterSchemaType = createMasterStoreData();

/**
 * GET handler for user meta data
 * Fetches user data from WordPress API and updates the master store
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
    console.log('🚀 Starting GET request for user meta.');

    const token = cookies.get('jwt_token');
    console.log('🔑 Token retrieved from cookies:', token);

    try {
        const user_id = url.searchParams.get('user_id');
        console.log('🔍 Checking query parameter "user_id":', user_id);

        if (!user_id) {
            console.error('❌ Missing "user_id" query parameter.');
            throw error(400, 'user_id is required as a query parameter.');
        }

        if (!token) {
            console.error('❌ Missing JWT token in cookies.');
            throw error(401, 'Authentication required');
        }

        const apiUrl = `https://wp.tributestream.com/wp-json/tributestream/v1/user-meta/${user_id}`;
        console.log('🔗 Sending request to WordPress API:', apiUrl);

        const wpResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📡 WordPress API response status:', wpResponse.status);

        if (!wpResponse.ok) {
            const errorData = await wpResponse.json();
            console.error('❌ WordPress API error:', {
                status: wpResponse.status,
                error: errorData
            });
            throw error(wpResponse.status, errorData.message || 'Failed to fetch meta entries.');
        }

        const responseData = await wpResponse.json();
        console.log('✅ Meta data successfully retrieved');
        
        // Process the retrieved data
        let masterDataEntry = null;
        
        // Check if the responseData has a meta array property
        if (responseData && typeof responseData === 'object' && Array.isArray(responseData.meta)) {
          // Find the master_data entry in the meta array
          masterDataEntry = responseData.meta.find((entry: WPMetaEntry) => entry.meta_key === 'master_data');
          console.log('✅ Found master_data entry in meta array:', !!masterDataEntry);
        } else {
          // Fall back to checking if responseData is an array directly (handle backward compatibility)
          if (Array.isArray(responseData)) {
            masterDataEntry = responseData.find((entry: WPMetaEntry) => entry.meta_key === 'master_data');
            console.log('✅ Found master_data entry in responseData array:', !!masterDataEntry);
          } else {
            console.error('❌ Unable to find meta array in response structure:',
              typeof responseData, Object.keys(responseData));
          }
        }
        
        if (masterDataEntry && masterDataEntry.meta_value) {
            try {
                // Parse the meta_value JSON
                const masterData = JSON.parse(masterDataEntry.meta_value) as MasterSchemaType;
                
                // Update serverMasterData with the retrieved data
                serverMasterData = updateMasterData(serverMasterData, masterData);
                
                console.log('✅ Master data updated with retrieved data');
            } catch (parseError: unknown) {
                const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
                console.error('❌ Error parsing master_data JSON:', errorMessage);
            }
        }

        return json(responseData);
    } catch (requestError: unknown) {
        const errorMessage = requestError instanceof Error ? requestError.message : 'Unknown error';
        const errorStack = requestError instanceof Error ? requestError.stack : 'No stack trace';
        const errorStatus = (requestError as { status?: number }).status || 500;
        
        console.error('💥 Error occurred in GET handler:', {
            message: errorMessage,
            stack: errorStack,
            status: errorStatus
        });
        throw error(errorStatus, errorMessage || 'Internal Server Error');
    }
};

/**
 * POST handler for user meta data
 * Validates and sends data to WordPress API and updates the master store
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
    console.log('🚀 Starting POST request for user meta.');
  
    // Retrieve the JWT token from cookies
    const token = cookies.get('jwt_token');
    if (!token) {
      console.error('❌ Missing JWT token in cookies.');
      throw error(401, 'Authentication required');
    }
    console.log('🔑 Token retrieved from cookies:', token);
  
    try {
        // Parse the request body
        const body = await request.json();
        const { user_id, masterData } = body as { user_id: string, masterData: MasterSchemaType };
  
        if (!user_id || !masterData) {
            throw error(400, 'user_id and masterData are required.');
        }
  
        // Validate and parse using Zod. This ensures the data adheres to your v1_structure.json blueprint.
        let validatedData: MasterSchemaType;
        try {
            validatedData = masterSchema.parse(masterData) as MasterSchemaType;
        } catch (validationError: unknown) {
            const zodError = validationError as z.ZodError;
            console.error('Validation error:', zodError.errors);
            throw error(400, 'Data validation failed.');
        }
  
        // Update the server-side master data
        serverMasterData = updateMasterData(serverMasterData, validatedData);
        console.log('✅ Master data updated with POST data');

        // Use the validated data to create meta_value for storage
        const meta_value = JSON.stringify(validatedData);
  
        // Now send meta_value to your user-meta endpoint.
        const apiUrl = `https://wp.tributestream.com/wp-json/tributestream/v1/user-meta`;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
  
        const requestBody = JSON.stringify({
            user_id,
            meta_key: 'master_data',
            meta_value
        });
  
        const wpResponse = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: requestBody
        });
  
        console.log('📡 WordPress API response status:', wpResponse.status);
  
        if (!wpResponse.ok) {
            const errorData = await wpResponse.json();
            console.error('❌ WordPress API error:', {
                status: wpResponse.status,
                error: errorData,
            });
            throw error(wpResponse.status, errorData.message || 'Failed to write meta entry.');
        }
  
        const responseData = await wpResponse.json();
        console.log('✅ Meta data successfully written:', responseData);
  
        return json(responseData);
    } catch (requestError: unknown) {
        const errorMessage = requestError instanceof Error ? requestError.message : 'Unknown error';
        const errorStack = requestError instanceof Error ? requestError.stack : 'No stack trace';
        const errorStatus = (requestError as { status?: number }).status || 500;
        
        console.error('💥 Error occurred in POST handler:', {
            message: errorMessage,
            stack: errorStack,
            status: errorStatus
        });
        throw error(errorStatus, errorMessage || 'Internal Server Error');
    }
};