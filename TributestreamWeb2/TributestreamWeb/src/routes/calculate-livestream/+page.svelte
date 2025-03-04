<script lang="ts">
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  import { getMasterStoreContext } from '$lib/stores/master-store.svelte';
  import { getTributePageStoreContext } from '$lib/stores/tribute-page-store.svelte';
  import { processFormActionForBothStores } from '$lib/utils/form-action-helper';
  import MemorialCalculator from '$lib/components/MemorialCalculator.svelte';
  import CcForm from '$lib/CcForm.svelte';
  import type { PageData } from './$types';

  // Get the props and stores
  let { data, form }: { data: PageData, form: any } = $props();
  const masterStore = getMasterStoreContext();
  const tributeStore = getTributePageStoreContext();

  // Data from the server
  const appId = data.appId;
  const locationId = data.locationId;
  let fdFormData = data.userMeta?.memorial_form_data;
  
  // Parse and extract user data
  let flattenedFormData: Record<string, any> = {};
  
  // Process form data if available
  $effect(() => {
    if (fdFormData) {
      try {
        const parsedData = typeof fdFormData === 'string' 
          ? JSON.parse(fdFormData) 
          : fdFormData;

        // Flattening logic
        flattenedFormData = {
          directorFirstName: parsedData.director?.firstName || '',
          directorLastName: parsedData.director?.lastName || '',
          familyMemberFirstName: parsedData.familyMember?.firstName || '',
          familyMemberLastName: parsedData.familyMember?.lastName || '',
          familyMemberDob: parsedData.familyMember?.dob || '',
          deceasedFirstName: parsedData.deceased?.firstName || '',
          deceasedLastName: parsedData.deceased?.lastName || '',
          deceasedDob: parsedData.deceased?.dob || '',
          deceasedDop: parsedData.deceased?.dop || '',
          contactEmail: parsedData.contact?.email || '',
          contactPhone: parsedData.contact?.phone || '',
          memorialLocationName: parsedData.memorial?.locationName || '',
          memorialLocationAddress: parsedData.memorial?.locationAddress || '',
          memorialTime: parsedData.memorial?.time || '',
          memorialDate: parsedData.memorial?.date || ''
        };

        console.log('Flattened Form Data:', flattenedFormData);
      } catch (error) {
        console.error('Failed to parse and flatten JSON data:', error);
      }
    }
  });
  
  // Initialize the MasterStore with data from the server/form
  $effect(() => {
    // Initialize only if we have data and haven't already initialized
    if (Object.keys(flattenedFormData).length > 0) {
      // Update the Master Store with the flattened data
      masterStore.updateDirectorInfo({
        firstName: flattenedFormData.directorFirstName || '',
        lastName: flattenedFormData.directorLastName || '',
        funeralHomeName: flattenedFormData.memorialLocationName || '',
        funeralHomeAddress: flattenedFormData.memorialLocationAddress || ''
      });
      
      masterStore.updateLovedOneInfo({
        fullName: `${flattenedFormData.deceasedFirstName || ''} ${flattenedFormData.deceasedLastName || ''}`.trim(),
        dateOfBirth: flattenedFormData.deceasedDob || '',
        dateOfPassing: flattenedFormData.deceasedDop || ''
      });
      
      masterStore.updateUserInfo({
        fullName: `${flattenedFormData.familyMemberFirstName || ''} ${flattenedFormData.familyMemberLastName || ''}`.trim(),
        emailAddress: flattenedFormData.contactEmail || '',
        phoneNumber: flattenedFormData.contactPhone || ''
      });
      
      // Update memorial info (without locations)
      masterStore.updateMemorialInfo({
        startTime: flattenedFormData.memorialTime || '',
        date: flattenedFormData.memorialDate || ''
      });
      
      // Then update the first location separately
      if (masterStore.memorialInfo.locations.length > 0) {
        masterStore.updateMemorialLocation(0, {
          name: flattenedFormData.memorialLocationName || '',
          address: flattenedFormData.memorialLocationAddress || ''
        });
      }
      
      // Initialize LiveStreamInfo based on memorial info
      masterStore.updateLiveStreamInfo({
        date: flattenedFormData.memorialDate || '',
        startTime: flattenedFormData.memorialTime || '',
        duration: '2' // Default duration
      });
    }
  });
  
  // Update the tribute store with the loved one's info
  $effect(() => {
    if (masterStore.lovedOneInfo.fullName) {
      tributeStore.updateCurrentTribute({
        title: masterStore.lovedOneInfo.fullName,
        memorialDate: masterStore.memorialInfo.date,
        memorialLocation: masterStore.memorialInfo.locations[0]?.name
      });
    }
  });
  
  // Process form action result
  $effect(() => {
    if (form) {
      // Convert SvelteKit form result to our FormActionResult format
      const formActionResult = {
        success: form.success || false,
        error: form.error || false,
        message: form.message || '',
        data: form.data || {}
      };
      
      // Process the form action result for both stores
      processFormActionForBothStores(
        formActionResult,
        masterStore,
        tributeStore
      );
    }
  });
  
  // Prepare data for CcForm
  const originalData = $state({
    firstName: flattenedFormData.familyMemberFirstName || '',
    lastName: flattenedFormData.familyMemberLastName || '',
    email: flattenedFormData.contactEmail || '',
    phone: flattenedFormData.contactPhone || '',
    address: flattenedFormData.memorialLocationAddress || '',
  });
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8 text-center">Calculate Memorial Livestream</h1>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Memorial Calculator Component -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4">Memorial Package Selection</h2>
      <MemorialCalculator {form} />
    </div>
    
    <!-- Credit Card Form -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4">Payment Information</h2>
      <CcForm appId={appId} locationId={locationId} initialData={originalData}/>
    </div>
  </div>
  
  <!-- Summary Information -->
  <div class="mt-8 bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-semibold mb-4">Memorial Details</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 class="text-lg font-medium">Loved One</h3>
        <p class="text-gray-700">{masterStore.lovedOneInfo.fullName || 'Not specified'}</p>
        {#if masterStore.lovedOneInfo.dateOfBirth}
          <p class="text-gray-700">Born: {masterStore.lovedOneInfo.dateOfBirth}</p>
        {/if}
        {#if masterStore.lovedOneInfo.dateOfPassing}
          <p class="text-gray-700">Passed: {masterStore.lovedOneInfo.dateOfPassing}</p>
        {/if}
      </div>
      
      <div>
        <h3 class="text-lg font-medium">Contact Person</h3>
        <p class="text-gray-700">{masterStore.userInfo.fullName || 'Not specified'}</p>
        <p class="text-gray-700">{masterStore.userInfo.emailAddress || 'No email provided'}</p>
        <p class="text-gray-700">{masterStore.userInfo.phoneNumber || 'No phone provided'}</p>
      </div>
    </div>
    
    <div class="mt-4">
      <h3 class="text-lg font-medium">Memorial Schedule</h3>
      {#if masterStore.scheduleDays && masterStore.scheduleDays.length > 0}
        <div class="space-y-2">
          {#each masterStore.scheduleDays as day, index}
            <div class="p-3 border rounded">
              <p class="font-medium">Day {index + 1}: {day.date || 'Date not specified'}</p>
              
              {#if day.locations && day.locations.length > 0}
                <div class="ml-4 space-y-2">
                  {#each day.locations as location, locIndex}
                    <div>
                      <p>Location {locIndex + 1}: {location.name || 'Not specified'}</p>
                      <p class="text-sm text-gray-600">{location.address || 'No address provided'}</p>
                      <p class="text-sm text-gray-600">
                        Start: {location.startTime || 'Not specified'}, 
                        Duration: {location.duration || 0} hours
                      </p>
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="text-gray-500 ml-4">No locations specified</p>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-gray-500">No schedule days specified</p>
      {/if}
    </div>
  </div>
</div>
