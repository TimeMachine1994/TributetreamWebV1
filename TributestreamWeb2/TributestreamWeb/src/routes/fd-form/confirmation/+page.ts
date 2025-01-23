import type { PageLoad } from './$types';
export const load: PageLoad = async ({ data }) => {
    return {
        appId: data.appId,
        locationId: data.locationId,
        userMeta: data.userMeta
    };
};
