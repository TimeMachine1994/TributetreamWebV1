import type { PageLoad } from './$types';

interface PageData {
    meta: {
        memorial_form_data: string;
        [key: string]: any;
    };
    userId: string;
    token: string;
}

// Using test values for Square integration
const TEST_APP_ID = 'sandbox-sq0idb-test-app-id';
const TEST_LOCATION_ID = 'LKYXSPGPXK5KN'; // Square test location ID

export const load: PageLoad = async ({ data }) => {
    // Get the data from the server load function
    const serverData = data as PageData;

    return {
        userMeta: serverData.meta,
        userId: serverData.userId,
        token: serverData.token,
        appId: TEST_APP_ID,
        locationId: TEST_LOCATION_ID
    };
};
