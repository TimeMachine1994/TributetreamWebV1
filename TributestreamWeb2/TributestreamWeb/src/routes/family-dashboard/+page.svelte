     <script lang="ts">
	import { page } from '$app/stores';
    import CcForm from '$lib/CcForm.svelte';
    import type { PageData } from './$types';
    let { data }: { data: PageData } = $props();
    const appId = data.appId;
    const locationId = data.locationId;
    let fdFormData = data.userMeta.memorial_form_data;
    console.log('Form Data (Raw):', fdFormData);

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
    </script>
 
 <div class="max-w-4xl mx-auto space-y-6">
    
  <!-- Card: Payment Status and Event Overview -->
  <div class="bg-white rounded-lg shadow p-6 space-y-4">
    
    <!-- Payment Status Bar -->
    <div class="flex items-center justify-between bg-green-50 border border-green-300 rounded p-3">
      <div class="flex items-center space-x-2 text-green-700">
        <!-- Checkmark icon (optional) -->
        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M20.285 2.998a1 1 0 0 1 .709 1.707l-11 11a1 1 0 0 1-1.414 0l-5-5a1 1 0 1 1 1.414-1.414l4.293 4.293 10.293-10.293a1 1 0 0 1 1.414 0z"/>
        </svg>
        <span class="font-semibold">Payment Status: Complete</span>
      </div>
    </div>
    
    <!-- Main Event Details (Title / Info / Media Placeholder) -->
    <div class="flex flex-col md:flex-row md:space-x-6">
      
      <!-- Text Details -->
      <div class="md:flex-1 space-y-2 mb-4 md:mb-0">
        <!-- Title of the Event -->
        <h2 class="text-2xl font-bold text-gray-700">Celebration of life for Marie Marie Marie</h2>

        <!-- Starting Location -->
        <div>
          <h3 class="text-sm font-semibold text-gray-600">Starting Location</h3>
          <p class="text-gray-800">Test Data</p>
          <p class="text-gray-800">10114 Test Data Road</p>
        </div>

        <!-- Start Time -->
        <div>
          <h3 class="text-sm font-semibold text-gray-600">Start Time</h3>
          <p class="text-gray-800">Jan 1, 2024 @ 3:30 PM</p>
        </div>

        <!-- Notes -->
        <div>
          <h3 class="text-sm font-semibold text-gray-600">Notes</h3>
          <p class="text-gray-800">As needed.</p>
        </div>
      </div>
      
      <!-- Media Placeholder -->
      <div class="md:w-1/2 h-48 bg-black rounded flex items-center justify-center text-white">
        <span class="text-sm">Media Placeholder</span>
      </div>
    </div>
  </div> <!-- End of Payment Status + Event Details Card -->
  
  <!-- Action Buttons -->
  <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
    <!-- Button 1 -->
    <button class="flex-1 bg-blue-100 text-blue-800 py-2 px-4 rounded shadow text-center font-semibold">
      Upload Media for Livestream
    </button>
    <!-- Button 2 -->
    <button class="flex-1 bg-red-100 text-red-800 py-2 px-4 rounded shadow text-center font-semibold">
      Edit Livestream Schedule
    </button>
    <!-- Button 3 -->
    <button class="flex-1 bg-pink-100 text-pink-800 py-2 px-4 rounded shadow text-center font-semibold">
      Transfer Family Point of Contact
    </button>
    <!-- Button 4 -->
    <button class="flex-1 bg-purple-100 text-purple-800 py-2 px-4 rounded shadow text-center font-semibold">
      Invite Others to Share Media
    </button>
  </div>

  <!-- Current Livestream Schedule Section -->
  <div class="bg-white rounded-lg shadow p-6">
    <!-- Header with "Current Livestream Schedule" and "Edit" button -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold text-gray-700">Current Livestream Schedule</h3>
      <button class="bg-red-100 text-red-800 py-1 px-3 rounded shadow font-semibold">
        Edit
      </button>
    </div>
    
    <!-- Table Headers -->
    <div class="hidden md:grid grid-cols-4 text-gray-600 font-semibold text-sm border-b border-gray-200 pb-2">
      <span>Start Time</span>
      <span>Stream Type</span>
      <span>Est. Duration</span>
      <span>Location</span>
    </div>
    
    <!-- Schedule Entries (Mock Data) -->
    <!-- Entry 1 -->
    <div class="grid grid-cols-1 md:grid-cols-4 items-center text-gray-800 py-3 border-b border-gray-100">
      <span class="font-semibold">11:00 AM</span>
      <span>Viewing</span>
      <span>1 Hour</span>
      <span>A Community Funeral Home, 910 W Michigan St, Orlando, FL 32805</span>
    </div>
    <!-- Entry 2 -->
    <div class="grid grid-cols-1 md:grid-cols-4 items-center text-gray-800 py-3 border-b border-gray-100">
      <span class="font-semibold">12:00 PM</span>
      <span>Service</span>
      <span>1 Hour</span>
      <span>A Community Funeral Home, 910 W Michigan St, Orlando, FL 32805</span>
    </div>
    <!-- Entry 3 -->
    <div class="grid grid-cols-1 md:grid-cols-4 items-center text-gray-800 py-3">
      <span class="font-semibold">12:30 PM</span>
      <span>Burial</span>
      <span>30 Min</span>
      <span>Woodlawn Memory Gardens, 400 Woodlawn Cemetery Rd, Gotha, FL 34734</span>
    </div>
  </div>
</div>
