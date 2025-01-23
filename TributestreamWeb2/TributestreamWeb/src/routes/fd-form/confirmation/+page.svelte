<script lang="ts">
    import SelectableSquares from '$lib/SelectableSquares.svelte';
    import Calc from '$lib/Calc.svelte';
    import CcForm from '$lib/CcForm.svelte';
    import { masterStore } from '$lib/stores/userStore';
    import type { PageData } from './types';
    
    let { data }: { data: PageData } = $props();

    // Ensure required data is present
    if (!data.appId || !data.locationId) {
        console.error('Missing required Square configuration');
    }

    const appId = data.appId;
    const locationId = data.locationId;
    let fdFormData = data.userMeta?.memorial_form_data;
    let card = $state('');

    // Initialize form data
    let originalData = $state({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
    });

    // Initialize store with form data
    if (fdFormData) {
        try {
            const parsedData = JSON.parse(fdFormData);

            // Update user data in store
            masterStore.updateUserData({
                appId,
                locationId,
                userMeta: {
                    memorial_form_data: fdFormData
                }
            });

            // Update order data with location information
            masterStore.updateOrderData({
                funeralHome: {
                    name: parsedData.director.funeralHomeName || '',
                    address: parsedData.director.funeralHomeAddress || ''
                },
                memorialLocation: {
                    name: parsedData.memorial.locationName || '',
                    address: parsedData.memorial.locationAddress || ''
                }
            });

            // Flatten form data for the credit card form
            const flattenedFormData = {
                directorFirstName: parsedData.director.firstName,
                directorLastName: parsedData.director.lastName,
                familyMemberFirstName: parsedData.familyMember.firstName,
                familyMemberLastName: parsedData.familyMember.lastName,
                familyMemberDob: parsedData.familyMember.dob,
                deceasedFirstName: parsedData.deceased.firstName,
                deceasedLastName: parsedData.deceased.lastName,
                deceasedDob: parsedData.deceased.dob,
                deceasedDop: parsedData.deceased.dop,
                contactEmail: parsedData.contact.email,
                contactPhone: parsedData.contact.phone,
                memorialLocationName: parsedData.memorial.locationName,
                memorialLocationAddress: parsedData.memorial.locationAddress,
                memorialTime: parsedData.memorial.time,
                memorialDate: parsedData.memorial.date
            };

            // Update form data
            originalData = {
                firstName: flattenedFormData.familyMemberFirstName || '',
                lastName: flattenedFormData.familyMemberLastName || '',
                email: flattenedFormData.contactEmail || '',
                phone: flattenedFormData.contactPhone || '',
                address: flattenedFormData.memorialLocationAddress || '',
            };

        } catch (error) {
            console.error('Failed to parse and process form data:', error);
        }
    } else {
        console.warn('No memorial form data found in userMeta');
    }
</script>
<div class="max-w-3xl mx-auto px-4 space-y-8">
    <SelectableSquares />
    <div class="max-w-xl mx-auto space-y-8">
        <Calc/>
        <CcForm appId={appId} locationId={locationId} initialData={originalData}/>
    </div>
</div>

<style>
    /* Ensure consistent width for forms */
    :global(.max-w-xl) {
        width: 100%;
        max-width: 48rem; /* Matches width of three boxes */
    }

    /* Add spacing between sections */
    :global(.space-y-8 > :not([hidden]) ~ :not([hidden])) {
        margin-top: 2rem;
    }
</style>
