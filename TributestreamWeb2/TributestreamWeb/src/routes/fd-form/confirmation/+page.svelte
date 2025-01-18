<script lang="ts">
        let selectedSquare: number | null = $state(null);
     // Function to handle square selection
    function handleSquareClick(index: number) {
        selectedSquare = index;
    }
    import SelectableSquares from '$lib/SelectableSquares.svelte';
    import Calc from '$lib/Calc.svelte';
    import CcForm from '$lib/CcForm.svelte';
    import type { PageData } from './$types';
    let { data }: { data: PageData } = $props();
    const appId = data.appId;
    const locationId = data.locationId;
    let fdFormData = data.userMeta.memorial_form_data;
    console.log('Form Data (Raw):', fdFormData);
    let card = $state('');;
 
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
 <SelectableSquares />
<Calc/>

<CcForm appId={appId} locationId={locationId} initialData={originalData}/>
