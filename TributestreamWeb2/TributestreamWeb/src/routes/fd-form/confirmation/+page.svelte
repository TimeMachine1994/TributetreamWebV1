<script lang="ts">
    import SelectableSquares from '$lib/SelectableSquares.svelte';
    import Calc from '$lib/Calc.svelte';
    import { masterStore } from '$lib/stores/userStore';
    import type { PageData } from './types';
    let { data }: { data: PageData } = $props();
    // Subscribe to the store using derived
    const store = $derived($masterStore);
    const memorialFormData = $derived(
        store.userData.userMeta?.memorial_form_data 
        ? JSON.parse(store.userData.userMeta.memorial_form_data)
        : null
    );

    // Initialize store with form data
    if (data.userMeta?.memorial_form_data) {
        try {
            const parsedData = JSON.parse(data.userMeta.memorial_form_data);

            // Update user data in store
            masterStore.updateUserData({
                appId: data.appId,
                locationId: data.locationId,
                userMeta: {
                    memorial_form_data: data.userMeta.memorial_form_data
                }
            });

            // Update order data with location information
            masterStore.updateOrderData({
                funeralHome: {
                    name: parsedData.memorial.locationName || '', // Initially same as memorial location
                    address: parsedData.memorial.locationAddress || '',
                    directorName: `${parsedData.director.firstName} ${parsedData.director.lastName}`
                },
                memorialLocation: {
                    name: parsedData.memorial.locationName || '',
                    address: parsedData.memorial.locationAddress || ''
                },
                details: {
                    cartItems: [], // Default empty array for required field
                    total: 0,      // Default value for required field
                    duration: 0,   // Default value for required field
                    locations: [], // Default value for required field
                    livestreamDate: parsedData.memorial.date || '',
                    livestreamStartTime: parsedData.memorial.time || '',
                    ...(store.orderData.details || {}) // Spread existing details after defaults
                },
                selectedPackage: undefined // Ensure calculator is initially hidden
            });

        } catch (error) {
            console.error('Failed to parse and process form data:', error);
        }
    }

</script>

<div class="max-w-[90vw] mx-auto px-4 space-y-8">
    <SelectableSquares />
    <Calc 
        initialStartTime={memorialFormData?.memorial?.time || ''} 
    />
</div>
