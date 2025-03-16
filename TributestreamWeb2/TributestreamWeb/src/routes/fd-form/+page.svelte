<script lang="ts">
  import { getMasterStoreContext } from '$lib/stores/master-store.svelte';
  import { getTributePageStoreContext } from '$lib/stores/tribute-page-store.svelte';
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import { processFormActionResult } from '$lib/utils/form-action-helpers';
  import { createTributeUrl, createTributeSlug } from '$lib/utils/string-helpers';

  // Get form data from props and initialize stores
  let { form } = $props();
  const masterStore = getMasterStoreContext();
  const tributeStore = getTributePageStoreContext();
  
  // Load data from local storage on mount
  onMount(() => {
    masterStore.loadFromLocalStorage();
    tributeStore.loadFromLocalStorage();
  });

  // Generate custom tribute URL from loved one's name
  let tributeUrl = $derived(() => {
    if (masterStore.lovedOneInfo.fullName) {
      const slug = createTributeSlug(masterStore.lovedOneInfo.fullName);
      return createTributeUrl(slug, true);
    }
    return '';
  });

  // Debug log to see what's in the form
  $effect(() => {
    if (form) {
      console.log('Current form state:', JSON.stringify(form, null, 2));
    }
  });

  // Process form action results using our helper
  $effect(() => {
    processFormActionResult(form, masterStore, '/calculator');
    
    // If the form contains tribute data, update the tribute store
    if (form?.success && 'tributeData' in (form || {}) && form.tributeData) {
      tributeStore.updateCurrentTribute(form.tributeData.currentTribute);
      tributeStore.saveToLocalStorage();
    }
  });
</script>

<div class="container mx-auto p-4">
  <div class="flex items-center mb-6">
    <form method="POST" action="?/goBack">
      <button
        type="submit"
        class="mr-4 bg-secondary text-secondary-foreground px-3 py-2 rounded-md"
      >
        ← Back
      </button>
    </form>
    <h1 class="text-2xl font-bold">Funeral Director Information</h1>
  </div>
  
  <div class="max-w-3xl mx-auto bg-card p-6 rounded-lg shadow-md">
    <form method="POST" action="?/saveDirectorInfo" use:enhance class="space-y-6">
      <!-- Funeral Director Section -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Funeral Director Details</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Director's First Name -->
          <div class="space-y-1">
            <label for="directorsFirstName" class="block text-sm font-medium">
              Director's First Name*
            </label>
            <input 
              type="text" 
              id="directorsFirstName" 
              name="directorsFirstName"
              class="w-full p-2 border rounded-md focus:ring-primary focus:border-primary {form?.error && form?.message?.includes('Director\'s first name') ? 'border-destructive' : ''}"
              value={masterStore.directorInfo.firstName || ''}
              placeholder="Enter director's first name"
            />
            {#if form?.error && form?.message?.includes("Director's first name")}
              <p class="text-destructive text-sm">Director's first name is required</p>
            {/if}
          </div>
          
          <!-- Director's Last Name -->
          <div class="space-y-1">
            <label for="directorsLastName" class="block text-sm font-medium">
              Director's Last Name*
            </label>
            <input 
              type="text" 
              id="directorsLastName" 
              name="directorsLastName"
              class="w-full p-2 border rounded-md focus:ring-primary focus:border-primary {form?.error && form?.message?.includes('Director\'s last name') ? 'border-destructive' : ''}"
              value={masterStore.directorInfo.lastName || ''}
              placeholder="Enter director's last name"
            />
            {#if form?.error && form?.message?.includes("Director's last name")}
              <p class="text-destructive text-sm">Director's last name is required</p>
            {/if}
          </div>
          
          <!-- Funeral Home Name -->
          <div class="space-y-1">
            <label for="funeralHomeName" class="block text-sm font-medium">
              Funeral Home Name*
            </label>
            <input 
              type="text" 
              id="funeralHomeName" 
              name="funeralHomeName"
              class="w-full p-2 border rounded-md focus:ring-primary focus:border-primary {form?.error && form?.message?.includes('Funeral home name') ? 'border-destructive' : ''}"
              value={masterStore.directorInfo.funeralHomeName || ''}
              placeholder="Enter funeral home name"
            />
            {#if form?.error && form?.message?.includes("Funeral home name")}
              <p class="text-destructive text-sm">Funeral home name is required</p>
            {/if}
          </div>
          
          <!-- Funeral Home Address -->
          <div class="space-y-1">
            <label for="funeralHomeAddress" class="block text-sm font-medium">
              Funeral Home Address*
            </label>
            <input 
              type="text" 
              id="funeralHomeAddress" 
              name="funeralHomeAddress"
              class="w-full p-2 border rounded-md focus:ring-primary focus:border-primary {form?.error && form?.message?.includes('Funeral home address') ? 'border-destructive' : ''}"
              value={masterStore.directorInfo.funeralHomeAddress || ''}
              placeholder="Enter funeral home address"
            />
            {#if form?.error && form?.message?.includes("Funeral home address")}
              <p class="text-destructive text-sm">Funeral home address is required</p>
            {/if}
          </div>
        </div>
      </div>
      
      <!-- Loved One Section -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Loved One Details</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Loved One's Full Name -->
          <div class="space-y-1">
            <label for="lovedOnesFullName" class="block text-sm font-medium">
              Loved One's Full Name*
            </label>
            <input 
              type="text" 
              id="lovedOnesFullName" 
              name="lovedOnesFullName"
              class="w-full p-2 border rounded-md focus:ring-primary focus:border-primary {form?.error && form?.message?.includes('Loved one\'s name') ? 'border-destructive' : ''}"
              value={masterStore.lovedOneInfo.fullName || ''}
              placeholder="Enter loved one's full name"
            />
            {#if form?.error && form?.message?.includes("Loved one's name")}
              <p class="text-destructive text-sm">Loved one's name is required</p>
            {/if}
          </div>
          
          <!-- Loved One's Date of Birth -->
          <div class="space-y-1">
            <label for="lovedOnesDOB" class="block text-sm font-medium">
              Loved One's Date of Birth
            </label>
            <input 
              type="date" 
              id="lovedOnesDOB" 
              name="lovedOnesDOB"
              class="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              value={masterStore.lovedOneInfo.dateOfBirth || ''}
            />
          </div>
          
          <!-- Loved One's Date of Passing -->
          <div class="space-y-1 md:col-span-2">
            <label for="lovedOnesDateOfPassing" class="block text-sm font-medium">
              Loved One's Date of Passing
            </label>
            <input 
              type="date" 
              id="lovedOnesDateOfPassing" 
              name="lovedOnesDateOfPassing"
              class="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              value={masterStore.lovedOneInfo.dateOfPassing || ''}
            />
          </div>
        </div>
      </div>
      
      <!-- User Information Section -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Your Information</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- User's Full Name -->
          <div class="space-y-1">
            <label for="usersFullName" class="block text-sm font-medium">
              Your Full Name*
            </label>
            <input 
              type="text" 
              id="usersFullName" 
              name="usersFullName"
              class="w-full p-2 border rounded-md focus:ring-primary focus:border-primary {form?.error && form?.message?.includes('Your full name') ? 'border-destructive' : ''}"
              value={masterStore.userInfo.fullName || ''}
              placeholder="Enter your full name"
            />
            {#if form?.error && form?.message?.includes("Your full name")}
              <p class="text-destructive text-sm">Your full name is required</p>
            {/if}
          </div>
          
          <!-- User's Email Address -->
          <div class="space-y-1">
            <label for="usersEmailAddress" class="block text-sm font-medium">
              Your Email Address*
            </label>
            <input 
              type="email" 
              id="usersEmailAddress" 
              name="usersEmailAddress"
              class="w-full p-2 border rounded-md focus:ring-primary focus:border-primary {form?.error && form?.message?.includes('Email address') ? 'border-destructive' : ''}"
              value={masterStore.userInfo.emailAddress || ''}
              placeholder="Enter your email address"
            />
            {#if form?.error && form?.message?.includes("Email address")}
              <p class="text-destructive text-sm">Email address is required</p>
            {/if}
            {#if form?.error && form?.message?.includes("valid email")}
              <p class="text-destructive text-sm">Please enter a valid email address</p>
            {/if}
          </div>
          
          <!-- User's Date of Birth -->
          <div class="space-y-1">
            <label for="usersDOB" class="block text-sm font-medium">
              Your Date of Birth
            </label>
            <input 
              type="date" 
              id="usersDOB" 
              name="usersDOB"
              class="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              value={masterStore.userInfo.dateOfBirth || ''}
            />
          </div>
          
          <!-- User's Phone Number -->
          <div class="space-y-1">
            <label for="usersPhoneNumber" class="block text-sm font-medium">
              Your Phone Number*
            </label>
            <input 
              type="tel" 
              id="usersPhoneNumber" 
              name="usersPhoneNumber"
              class="w-full p-2 border rounded-md focus:ring-primary focus:border-primary {form?.error && form?.message?.includes('Phone number') ? 'border-destructive' : ''}"
              value={masterStore.userInfo.phoneNumber || ''}
              placeholder="Enter your phone number"
            />
            {#if form?.error && form?.message?.includes("Phone number")}
              <p class="text-destructive text-sm">Phone number is required</p>
            {/if}
          </div>
        </div>
      </div>
      
      <!-- Memorial Information Section -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Memorial Details</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Memorial Location Name -->
          <div class="space-y-1">
            <label for="memorialLocationName" class="block text-sm font-medium">
              Memorial Location Name
            </label>
            <input 
              type="text" 
              id="memorialLocationName" 
              name="memorialLocationName"
              class="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              value={masterStore.memorialInfo.locations[0]?.name || ''}
              placeholder="Enter memorial location name"
            />
          </div>
          
          <!-- Memorial Location Address -->
          <div class="space-y-1">
            <label for="memorialLocationAddress" class="block text-sm font-medium">
              Memorial Location Address
            </label>
            <input 
              type="text" 
              id="memorialLocationAddress" 
              name="memorialLocationAddress"
              class="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              value={masterStore.memorialInfo.locations[0]?.address || ''}
              placeholder="Enter memorial location address"
            />
          </div>
          
          <!-- Memorial Start Time -->
          <div class="space-y-1">
            <label for="memorialStartTime" class="block text-sm font-medium">
              Memorial Start Time
            </label>
            <input 
              type="time" 
              id="memorialStartTime" 
              name="memorialStartTime"
              class="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              value={masterStore.memorialInfo.startTime || ''}
            />
          </div>
          
          <!-- Memorial Date -->
          <div class="space-y-1">
            <label for="memorialDate" class="block text-sm font-medium">
              Memorial Date
            </label>
            <input 
              type="date" 
              id="memorialDate" 
              name="memorialDate"
              class="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              value={masterStore.memorialInfo.date || ''}
            />
          </div>
        </div>
      </div>
      
      <!-- Display general error message if any -->
      {#if form?.error && !form?.message?.includes("missing")}
        <div class="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>{form?.message}</p>
        </div>
      {/if}
      
      <div class="pt-4">
        <button
          type="submit"
          class="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          Next
        </button>
      </div>
      
      <p class="text-sm text-muted-foreground text-center">
        * Required fields
      </p>
    </form>
  </div>
</div>