<script lang="ts">
  import { enhance } from "$app/forms";
  import type { FuneralHome, Package, FormErrors } from './+page.server';
  
  // Define our own submit function type since SubmitFunction isn't available
  type EnhanceSubmitFunction = (node: HTMLFormElement) => {
    (input: {
      form: HTMLFormElement;
      action: URL;
      cancel: () => void;
    }): {
      update: (params: Record<string, any>) => void;
      result: {
        type: string;
        status?: number;
        error?: Error;
        data?: any;
      };
    };
  };
  
  // Define types for page data
  interface PageData {
    funeralHomes: FuneralHome[];
    packages: Package[];
    error?: string;
    errors?: FormErrors;
    user: any;
  }
  
  // Form state
  let lovedOnesFullName = $state("");
  let lovedOnesDOB = $state("");
  let lovedOnesDOD = $state("");
  let paymentComplete = $state(false);
  let customHTML = $state("");
  let funeralHomeId = $state("");
  let packageId = $state("");
  
  // Events state
  type MemorialEvent = {
    eventName: string;
    locationName: string;
    locationAddress: string;
    startDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
  };
  
  let events = $state<MemorialEvent[]>([
    {
      eventName: "",
      locationName: "",
      locationAddress: "",
      startDate: "",
      startTime: "",
      endTime: "",
      durationMinutes: 60
    }
  ]);
  
  // Loading state
  let isSubmitting = $state(false);
  
  // Derived properties
  let isValid = $derived(
    lovedOnesFullName.trim() !== "" && 
    lovedOnesDOB !== "" && 
    lovedOnesDOD !== ""
  );
  
  // Page data from server load function
  let { data } = $props<{ data: PageData }>();

  function addEvent() {
    console.log("🌟 Adding new event");
    events = [
      ...events,
      {
        eventName: "",
        locationName: "",
        locationAddress: "",
        startDate: "",
        startTime: "",
        endTime: "",
        durationMinutes: 60
      }
    ];
  }

  function removeEvent(index: number) {
    console.log(`🗑️ Removing event at index ${index}`);
    events = events.filter((_, i) => i !== index);
  }

  function handleSubmit() {
    console.log("📝 Form submitted");
    isSubmitting = true;
  }

  function handleEnhanceSubmit() {
    return ({ form, action, cancel }: { form: any; action: any; cancel: any }) => {
      console.log("🚀 Form data being submitted");
      isSubmitting = true;
      
      return async ({ result, update }: { result: any; update: any }) => {
        isSubmitting = false;
        
        if (result.type === 'success') {
          console.log("✅ Form submitted successfully!");
        } else if (result.type === 'error') {
          console.error("❌ Form submission error:", result.error);
        } else {
          console.log("Form result:", result);
        }
        
        update();
      };
    };
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">Create New Tribute</h1>
  
  {#if data.error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      <p>{data.error}</p>
    </div>
  {/if}
  
  <form method="POST" use:enhance={handleEnhanceSubmit} class="space-y-6">
    <!-- Loved One Information -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Loved One Information</h2>
      
      <div class="mb-4">
        <label for="lovedOnesFullName" class="block text-gray-700 font-medium mb-2">
          Full Name *
        </label>
        <input
          type="text"
          id="lovedOnesFullName"
          name="lovedOnesFullName"
          bind:value={lovedOnesFullName}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {#if data.errors?.lovedOnesFullName}
          <p class="text-red-500 text-sm mt-1">{data.errors.lovedOnesFullName}</p>
        {/if}
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="lovedOnesDOB" class="block text-gray-700 font-medium mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            id="lovedOnesDOB"
            name="lovedOnesDOB"
            bind:value={lovedOnesDOB}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {#if data.errors?.lovedOnesDOB}
            <p class="text-red-500 text-sm mt-1">{data.errors.lovedOnesDOB}</p>
          {/if}
        </div>
        
        <div>
          <label for="lovedOnesDOD" class="block text-gray-700 font-medium mb-2">
            Date of Death *
          </label>
          <input
            type="date"
            id="lovedOnesDOD"
            name="lovedOnesDOD"
            bind:value={lovedOnesDOD}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {#if data.errors?.lovedOnesDOD}
            <p class="text-red-500 text-sm mt-1">{data.errors.lovedOnesDOD}</p>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- Tribute Details -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Tribute Details</h2>
      
      <div class="mb-4">
        <label for="funeralHome" class="block text-gray-700 font-medium mb-2">
          Funeral Home *
        </label>
        <select
          id="funeralHome"
          name="funeralHome"
          bind:value={funeralHomeId}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a funeral home</option>
          {#each data.funeralHomes || [] as home}
            <option value={home.id}>{home.attributes.name}</option>
          {/each}
        </select>
        {#if data.errors?.funeralHome}
          <p class="text-red-500 text-sm mt-1">{data.errors.funeralHome}</p>
        {/if}
      </div>
      
      <div class="mb-4">
        <label for="package" class="block text-gray-700 font-medium mb-2">
          Package *
        </label>
        <select
          id="package"
          name="package"
          bind:value={packageId}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a package</option>
          {#each data.packages || [] as pkg}
            <option value={pkg.id}>{pkg.attributes.name}</option>
          {/each}
        </select>
        {#if data.errors?.package}
          <p class="text-red-500 text-sm mt-1">{data.errors.package}</p>
        {/if}
      </div>
      
      <div class="mb-4">
        <label for="customHTML" class="block text-gray-700 font-medium mb-2">
          Custom HTML
        </label>
        <textarea
          id="customHTML"
          name="customHTML"
          bind:value={customHTML}
          rows="5"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
        {#if data.errors?.customHTML}
          <p class="text-red-500 text-sm mt-1">{data.errors.customHTML}</p>
        {/if}
      </div>
      
      <div class="mb-4">
        <div class="flex items-center">
          <input
            type="checkbox"
            id="paymentComplete"
            name="paymentComplete"
            bind:checked={paymentComplete}
            class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label for="paymentComplete" class="ml-2 block text-gray-700">
            Payment Complete
          </label>
        </div>
        {#if data.errors?.paymentComplete}
          <p class="text-red-500 text-sm mt-1">{data.errors.paymentComplete}</p>
        {/if}
      </div>
    </div>
    
    <!-- Memorial Events -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Memorial Events</h2>
        <button 
          type="button"
          onclick={addEvent}
          class="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md flex items-center"
        >
          <span class="mr-1">+</span> Add Event
        </button>
      </div>
      
      {#each events as event, index}
        <div class="border rounded-md p-4 mb-4 relative">
          <h3 class="font-medium mb-3">Event #{index + 1}</h3>
          
          {#if events.length > 1}
            <button 
              type="button" 
              onclick={() => removeEvent(index)}
              class="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          {/if}
          
          <div class="mb-4">
            <label for={`events[${index}].eventName`} class="block text-gray-700 font-medium mb-2">
              Event Name *
            </label>
            <input
              type="text"
              id={`events[${index}].eventName`}
              name={`events[${index}].eventName`}
              bind:value={events[index].eventName}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for={`events[${index}].locationName`} class="block text-gray-700 font-medium mb-2">
                Location Name *
              </label>
              <input
                type="text"
                id={`events[${index}].locationName`}
                name={`events[${index}].locationName`}
                bind:value={events[index].locationName}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label for={`events[${index}].locationAddress`} class="block text-gray-700 font-medium mb-2">
                Location Address *
              </label>
              <input
                type="text"
                id={`events[${index}].locationAddress`}
                name={`events[${index}].locationAddress`}
                bind:value={events[index].locationAddress}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label for={`events[${index}].startDate`} class="block text-gray-700 font-medium mb-2">
                Date *
              </label>
              <input
                type="date"
                id={`events[${index}].startDate`}
                name={`events[${index}].startDate`}
                bind:value={events[index].startDate}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label for={`events[${index}].startTime`} class="block text-gray-700 font-medium mb-2">
                Start Time *
              </label>
              <input
                type="time"
                id={`events[${index}].startTime`}
                name={`events[${index}].startTime`}
                bind:value={events[index].startTime}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label for={`events[${index}].endTime`} class="block text-gray-700 font-medium mb-2">
                End Time *
              </label>
              <input
                type="time"
                id={`events[${index}].endTime`}
                name={`events[${index}].endTime`}
                bind:value={events[index].endTime}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div class="mt-4">
            <label for={`events[${index}].durationMinutes`} class="block text-gray-700 font-medium mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              id={`events[${index}].durationMinutes`}
              name={`events[${index}].durationMinutes`}
              bind:value={events[index].durationMinutes}
              min="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      {/each}
      
      {#if events.length === 0}
        <p class="text-gray-500 italic">No events added. Click "Add Event" to add a memorial event.</p>
      {/if}
    </div>
    
    <!-- Form Actions -->
    <div class="flex justify-end space-x-4">
      <a 
        href="/funeral-director-portal" 
        class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </a>
      <button
        type="submit"
        class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!isValid || isSubmitting}
      >
        {#if isSubmitting}
          <span class="inline-block animate-spin mr-2">⏳</span> Submitting...
        {:else}
          Submit Tribute
        {/if}
      </button>
    </div>
  </form>
</div>