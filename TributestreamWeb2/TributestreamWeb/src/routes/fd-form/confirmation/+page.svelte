<script lang="ts">
        let selectedSquare: number | null = $state(null);
     // Function to handle square selection
    function handleSquareClick(index: number) {
        selectedSquare = index;
    }
    import SelectableSquares from '$lib/SelectableSquares.svelte';
    import Calc from '$lib/Calc.svelte';
    import CcForm from '$lib/CcForm.svelte';
    import type { PageData } from './types';
    let { data }: { data: PageData } = $props();

    // Ensure required data is present
    if (!data.appId || !data.locationId) {
        console.error('Missing required Square configuration');
    }
    const appId = data.appId;
    const locationId = data.locationId;
    let fdFormData = data.userMeta?.memorial_form_data;
    console.log('Form Data (Raw):', fdFormData);
    let card = $state('');

    if (!data.userMeta?.memorial_form_data) {
        console.warn('No memorial form data found in userMeta');
    }
 
    // Parse and flatten the JSON string
    let flattenedFormData: any = {};
    if (fdFormData) {
        try {
            const parsedData = JSON.parse(fdFormData);

            // Flattening logic
            flattenedFormData = {
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

            console.log('Flattened Form Data:', flattenedFormData);
        } catch (error) {
            console.error('Failed to parse and flatten JSON data:', error);
        }
    }
 
 
    const originalData = $state({
        firstName: flattenedFormData.familyMemberFirstName || '',
        lastName: flattenedFormData.familyMemberLastName || '',
        email: flattenedFormData.contactEmail || '',
        phone: flattenedFormData.contactPhone || '',
        address: flattenedFormData.memorialLocationAddress || '',
    });
  

 </script>
<div class="max-w-3xl mx-auto px-4">
    <SelectableSquares />
    <div class="max-w-xl mx-auto">
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
</style>
