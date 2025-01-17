<script lang="ts">
    
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
 <div class="flex flex-col items-center justify-center text-center p-8">
    <p class="text-xl mb-4">Tributestream offers their sinciere condolences for your loss.</p>
    <p class="text-lg mb-6">Scan the QR code below to see a free sample of what your custom page will look like.</p>

    <div class="flex justify-center items-center mb-8">
        <div class="p-6 bg-white rounded-lg shadow-md">
            <a href="https://www.google.com" target="_blank">
                <button class="w-[100px] h-[100px] bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200" aria-label="QR Code Scanner"></button>
            </a>
        </div>
    </div>

    <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 mb-2">
        Click Here
    </button>
    <p class="text-lg">To Complete The Reservation Process</p>
</div>


<Calc/>

<CcForm appId={appId} locationId={locationId} initialData={originalData}/>
