<script lang="ts">
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  import { getUnifiedStoreContext } from '$lib/stores/unified-store.svelte';
  import CcForm from '$lib/CcForm.svelte';
  import type { PageData } from './$types';

  // Get the props and store
  let { data, form }: { data: PageData, form: any } = $props();
  const unifiedStore = getUnifiedStoreContext();

  // Data from the server
  const appId = data.appId;
  const locationId = data.locationId;
  const userMeta = data.userMeta || {};
  // Cast tributes data to correct type (handle case where it might not exist in data)
  const tributes = (data as any).tributes || [];
  
  // Set authentication token for API calls
  $effect(() => {
    if (data.token) {
      unifiedStore.setAuthToken(data.token);
    }
  });
  
  // State variables
  let isLoading = $state(false);
  let isEditingSchedule = $state(false);
  let isUploadingMedia = $state(false);
  let currentTributeId = $state('');
  let formSubmitting = $state(false);
  let formError = $state('');
  
  // Format a date into a readable string
  function formatDate(dateStr: string): string {
    if (!dateStr) return 'Date not set';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }
  
  // Format a time into a readable string
  function formatTime(timeStr: string): string {
    if (!timeStr) return 'Time not set';
    
    try {
      // Handle different time formats
      if (timeStr.includes(':')) {
        // Already in HH:MM format
        const [hours, minutes] = timeStr.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
      } else {
        return timeStr;
      }
    } catch (e) {
      return timeStr;
    }
  }
  
  // Load tribute data into store on mount
  onMount(async () => {
    isLoading = true;
    
    // Set token if available
    if (data.token) {
      unifiedStore.setAuthToken(data.token);
    }
    
    // Process user's memorial form data if available
    if (userMeta.memorial_form_data) {
      try {
        const parsedData = typeof userMeta.memorial_form_data === 'string'
          ? JSON.parse(userMeta.memorial_form_data)
          : userMeta.memorial_form_data;
        
        // Update store with form data
        unifiedStore.updateDirectorInfo({
          firstName: parsedData.director?.firstName || '',
          lastName: parsedData.director?.lastName || '',
          funeralHomeName: parsedData.memorial?.locationName || '',
          funeralHomeAddress: parsedData.memorial?.locationAddress || ''
        });
        
        unifiedStore.updateLovedOneInfo({
          fullName: `${parsedData.deceased?.firstName || ''} ${parsedData.deceased?.lastName || ''}`.trim(),
          dateOfBirth: parsedData.deceased?.dob || '',
          dateOfPassing: parsedData.deceased?.dop || ''
        });
        
        unifiedStore.updateUserInfo({
          fullName: `${parsedData.familyMember?.firstName || ''} ${parsedData.familyMember?.lastName || ''}`.trim(),
          emailAddress: parsedData.contact?.email || '',
          phoneNumber: parsedData.contact?.phone || ''
        });
        
        // Update memorial info (without locations)
        unifiedStore.updateMemorialInfo({
          startTime: parsedData.memorial?.time || '',
          date: parsedData.memorial?.date || ''
        });
      } catch (error) {
        console.error('Failed to parse memorial form data:', error);
      }
    }
    
    // Load user's tributes into store
    if (tributes && tributes.length > 0) {
      // Update recentTributes
      unifiedStore.recentTributes = tributes;
      
      // Set current tribute to the first one
      if (tributes[0]) {
        currentTributeId = tributes[0].id;
        unifiedStore.updateCurrentTribute(tributes[0]);
      }
    }
    
    // Save to localStorage for persistence
    unifiedStore.saveToLocalStorage();
    isLoading = false;
  });
  
  // Get the current tribute
  $effect(() => {
    // If current tribute ID changes, update the current tribute in the store
    if (currentTributeId) {
      const tribute = tributes.find((t: any) => t.id === currentTributeId);
      if (tribute) {
        unifiedStore.updateCurrentTribute(tribute);
      }
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
      
      // Process the form action result with store updates
      if (formActionResult.success) {
        // Handle success case
        if (formActionResult.data && formActionResult.data.tribute) {
          // Update current tribute if provided
          unifiedStore.updateCurrentTribute(formActionResult.data.tribute);
          
          // Update in recent tributes list
          unifiedStore.recentTributes = unifiedStore.recentTributes.map(tribute =>
            tribute.id === formActionResult.data.tribute.id
              ? formActionResult.data.tribute
              : tribute
          );
        }
      } else if (formActionResult.error) {
        // Handle error case
        formError = formActionResult.message || 'An error occurred';
        console.error('Form action error:', formError);
      }
      
      // Reset submission state
      formSubmitting = false;
      
      // Save updates to localStorage
      unifiedStore.saveToLocalStorage();
    }
  });
</script>

<div class="max-w-4xl mx-auto space-y-6 py-8 px-4">
  <h1 class="text-3xl font-bold text-gray-800">Family Dashboard</h1>

  <!-- Loading State -->
  {#if isLoading}
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  {:else}
    <!-- Tributes Selection -->
    {#if tributes.length > 0}
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Your Tributes</h2>
        
        <div class="space-y-2">
          {#each tributes as tribute}
            <button
              class="block w-full text-left p-3 rounded border {currentTributeId === tribute.id ? 'border-primary bg-primary/10' : 'border-gray-200 hover:bg-gray-50'}"
              on:click={() => currentTributeId = tribute.id}
            >
              <span class="font-medium">{tribute.title || 'Untitled Tribute'}</span>
              {#if tribute.memorialDate}
                <span class="text-sm text-gray-600 block">
                  {formatDate(tribute.memorialDate)}
                </span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}
    
    <!-- Current Tribute Details -->
    {#if unifiedStore.currentTribute.id}
      <div class="bg-white rounded-lg shadow p-6 space-y-4">
        <!-- Payment Status Bar -->
        <div class="flex items-center justify-between bg-green-50 border border-green-300 rounded p-3">
          <div class="flex items-center space-x-2 text-green-700">
            <!-- Checkmark icon -->
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M20.285 2.998a1 1 0 0 1 .709 1.707l-11 11a1 1 0 0 1-1.414 0l-5-5a1 1 0 1 1 1.414-1.414l4.293 4.293 10.293-10.293a1 1 0 0 1 1.414 0z"/>
            </svg>
            <span class="font-semibold">Payment Status: Complete</span>
          </div>
        </div>
        
        <!-- Main Event Details -->
        <div class="flex flex-col md:flex-row md:space-x-6">
          <!-- Text Details -->
          <div class="md:flex-1 space-y-2 mb-4 md:mb-0">
            <!-- Title of the Event -->
            <h2 class="text-2xl font-bold text-gray-700">
              Celebration of life for {unifiedStore.tributeTitle || 'Loved One'}
            </h2>

            <!-- Starting Location -->
            <div>
              <h3 class="text-sm font-semibold text-gray-600">Location</h3>
              <p class="text-gray-800">{unifiedStore.currentTribute.memorialLocation || unifiedStore.memorialInfo.locations[0]?.name || 'Not specified'}</p>
              <p class="text-gray-800">{unifiedStore.memorialInfo.locations[0]?.address || ''}</p>
            </div>

            <!-- Start Time -->
            <div>
              <h3 class="text-sm font-semibold text-gray-600">Date & Time</h3>
              <p class="text-gray-800">
                {formatDate(unifiedStore.currentTribute.memorialDate || unifiedStore.memorialInfo.date || '')}
                @ {formatTime(unifiedStore.memorialInfo.startTime || '')}
              </p>
            </div>

            <!-- Notes -->
            <div>
              <h3 class="text-sm font-semibold text-gray-600">Notes</h3>
              <p class="text-gray-800">{unifiedStore.currentTribute.notes || 'No notes provided.'}</p>
            </div>
            
            <!-- Share link -->
            <div>
              <h3 class="text-sm font-semibold text-gray-600">Share Link</h3>
              {#if unifiedStore.currentTribute.slug && typeof unifiedStore.currentTribute.slug === 'string'}
                <div class="flex items-center mt-1">
                  <input
                    readonly
                    value={`${window.location.origin}/celebration-of-life-for-${unifiedStore.currentTribute.slug}`}
                    class="text-sm bg-gray-100 p-2 rounded mr-2 flex-grow"
                  />
                  <button
                    class="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm"
                    on:click={() => {
                      const slug = unifiedStore.currentTribute.slug;
                      if (slug) {
                        navigator.clipboard.writeText(`${window.location.origin}/celebration-of-life-for-${slug}`);
                        alert('Link copied to clipboard!');
                      }
                    }}
                  >
                    Copy
                  </button>
                </div>
              {:else}
                <p class="text-gray-800">No share link available.</p>
              {/if}
            </div>
          </div>
          
          <!-- Media Placeholder -->
          {#if unifiedStore.currentTribute.thumbnailUrl}
            <div class="md:w-1/2">
              <img
                src={unifiedStore.currentTribute.thumbnailUrl}
                alt={unifiedStore.tributeTitle}
                class="w-full h-48 object-cover rounded"
              />
            </div>
          {:else}
            <div class="md:w-1/2 h-48 bg-gray-200 rounded flex items-center justify-center text-gray-500">
              <span class="text-sm">No Media Available</span>
            </div>
          {/if}
        </div>
      </div>
    {/if}
    
    <!-- Action Buttons -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- Button 1: Upload Media -->
      <form
        method="POST"
        action="/upload-media"
        class="contents"
      >
        <button
          type="submit"
          class="bg-blue-100 text-blue-800 py-2 px-4 rounded shadow text-center font-semibold hover:bg-blue-200 transition"
        >
          Upload Media for Livestream
        </button>
      </form>
      
      <!-- Button 2: Edit Schedule -->
      <form
        method="POST"
        action="?/editSchedule"
        use:enhance={() => {
          formSubmitting = true;
          formError = '';
          
          return ({ result }) => {
            if (result.type === 'failure') {
              formSubmitting = false;
              // Ensure message is a string before assigning to formError
              formError = typeof result.data?.message === 'string'
                ? result.data.message
                : 'Failed to process request';
            }
            // For redirect responses, we don't need to do anything
          };
        }}
        class="contents"
      >
        <button
          type="submit"
          class="bg-red-100 text-red-800 py-2 px-4 rounded shadow text-center font-semibold hover:bg-red-200 transition"
          disabled={formSubmitting}
        >
          {formSubmitting ? 'Processing...' : 'Edit Livestream Schedule'}
        </button>
      </form>
      
      <!-- Button 3: Edit Tribute -->
      <button
        on:click={() => {
          const slug = unifiedStore.currentTribute.slug;
          if (typeof slug === 'string' && slug.length > 0) {
            window.location.href = `/celebration-of-life-for-${slug}/edit`;
          } else {
            alert('No tribute selected or no slug available');
          }
        }}
        class="bg-purple-100 text-purple-800 py-2 px-4 rounded shadow text-center font-semibold hover:bg-purple-200 transition"
      >
        Edit Tribute Page
      </button>
      
      <!-- Button 4: View Live Page -->
      <button
        on:click={() => {
          const slug = unifiedStore.currentTribute.slug;
          if (typeof slug === 'string' && slug.length > 0) {
            window.open(`/celebration-of-life-for-${slug}`, '_blank');
          } else {
            alert('No tribute selected or no slug available');
          }
        }}
        class="bg-green-100 text-green-800 py-2 px-4 rounded shadow text-center font-semibold hover:bg-green-200 transition"
      >
        View Live Tribute Page
      </button>
    </div>
    
    <!-- Error Message -->
    {#if formError}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <span class="block sm:inline">{formError}</span>
      </div>
    {/if}
    
    <!-- Current Livestream Schedule Section -->
    {#if unifiedStore.scheduleDays && unifiedStore.scheduleDays.length > 0}
      <div class="bg-white rounded-lg shadow p-6">
        <!-- Header with "Current Livestream Schedule" and "Edit" button -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-700">Current Livestream Schedule</h3>
          <form method="POST" action="?/editSchedule">
            <button
              type="submit"
              class="bg-red-100 text-red-800 py-1 px-3 rounded shadow font-semibold hover:bg-red-200 transition"
            >
              Edit
            </button>
          </form>
        </div>
        
        <!-- Table Headers -->
        <div class="hidden md:grid grid-cols-4 text-gray-600 font-semibold text-sm border-b border-gray-200 pb-2">
          <span>Date & Time</span>
          <span>Location</span>
          <span>Duration</span>
          <span>Notes</span>
        </div>
        
        <!-- Schedule Content -->
        <div class="mt-3 space-y-4">
          {#each unifiedStore.scheduleDays as day, dayIndex}
            <div class="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
              <div class="font-medium text-gray-700 mb-2">Day {dayIndex + 1}: {formatDate(day.date)}</div>
              
              {#each day.locations as location, locIndex}
                <div class="md:grid grid-cols-4 py-2 border-t border-gray-100 first:border-t-0">
                  <!-- Mobile view shows labels -->
                  <div class="md:hidden font-semibold text-xs text-gray-500 uppercase mt-2">Date & Time</div>
                  <div class="mb-2 md:mb-0">{formatTime(location.startTime)}</div>
                  
                  <div class="md:hidden font-semibold text-xs text-gray-500 uppercase mt-2">Location</div>
                  <div class="mb-2 md:mb-0">{location.name}</div>
                  
                  <div class="md:hidden font-semibold text-xs text-gray-500 uppercase mt-2">Duration</div>
                  <div class="mb-2 md:mb-0">{location.duration} hours</div>
                  
                  <div class="md:hidden font-semibold text-xs text-gray-500 uppercase mt-2">Notes</div>
                  <div>{location.notes || 'No notes'}</div>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>
