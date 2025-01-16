<script lang="ts">
    import type { PageData } from './$types';
    let { data }: { data: PageData } = $props();
    const appId = data.appId;
    const locationId = data.locationId;
     
 
    let paymentStatus = $state('');

import Calc from '$lib/Calc.svelte';
import CcForm from '$lib/CcForm.svelte';
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

<CcForm appId={appId} locationId={locationId}/>

<Calc/>
Billing Information:
First Name Last name, Address, City, State, Zip Code, Phone Number, Email Address, Phone Number
CC Form
Click here to pay
 
directorFirstName: formData.get('director-first-name'),
directorLastName: formData.get('director-last-name'),
familyMemberFirstName: formData.get('family-member-first-name'),
familyMemberLastName: formData.get('family-member-last-name'),
familyMemberDOB: formData.get('family-member-dob'),
deceasedFirstName: formData.get('deceased-first-name'),
deceasedLastName: formData.get('deceased-last-name'),
deceasedDOB: formData.get('deceased-dob'),
deceasedDOP: formData.get('deceased-dop'),
email: formData.get('email-address'),
phone: formData.get('phone-number'),
locationName: formData.get('location-name'),
locationAddress: formData.get('location-address'),
memorialTime: formData.get('memorial-time'),
memorialDate: formData.get('memorial-date'),
//this is what is available via props