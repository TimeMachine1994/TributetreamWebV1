<script lang="ts">
  // Import Svelte's enhance
  import { enhance } from '$app/forms';
  
  // Import the data from the server
  export let data;
  
  // Extract data for easier access
  const { memorialEvents, pagination, tributes, user, error } = data;
  
  // Reactive state for the form
  let title = '';
  let description = '';
  let eventType = 'funeral'; // Default value
  let startDate = '';
  let endDate = '';
  let location = '';
  let city = '';
  let state = '';
  let zipCode = '';
  let tributeId = '';
  let formError = '';
  
  // Event type options
  const eventTypes = [
    { value: 'funeral', label: 'Funeral' },
    { value: 'viewing', label: 'Viewing' },
    { value: 'celebration-of-life', label: 'Celebration of Life' },
    { value: 'wake', label: 'Wake' },
    { value: 'memorial', label: 'Memorial Service' },
    { value: 'other', label: 'Other' }
  ];
  
  // Calculate pages for pagination
  const totalPages = Array.from({ length: pagination.pageCount || 1 }, (_, i) => i + 1);
  
  // Format date for display
  function formatDate(dateString: string): string {
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  }
  
  // Reset form after submission
  function resetForm() {
    title = '';
    description = '';
    eventType = 'funeral';
    startDate = '';
    endDate = '';
    location = '';
    city = '';
    state = '';
    zipCode = '';
    tributeId = '';
    formError = '';
  }
  
  // Get the tribute name by ID for display in the events list
  function getTributeName(tributeData: any): string {
    if (!tributeData || !tributeData.data) return 'Not specified';
    return tributeData.data.attributes.lovedOnesFullName;
  }
</script>

<svelte:head>
  <title>Memorial Events | TributeStream</title>
  <meta name="description" content="View and create memorial events for tributes" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8">Memorial Events</h1>
  
  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
      <p>{error}</p>
    </div>
  {/if}
  
  <!-- Create Memorial Event Form -->
  {#if user}
    <div class="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Create a New Memorial Event</h2>
      
      <form method="POST" action="?/create" use:enhance={() => {
        return async ({ result, update }) => {
          if (result.type === 'failure') {
            // Safely get the message without type assertions
            formError = result.data?.message as string || 'Failed to create memorial event';
          } else {
            resetForm();
          }
          await update();
        };
      }}>
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            bind:value={title}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div class="mb-4">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            bind:value={description}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          ></textarea>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label for="eventType" class="block text-sm font-medium text-gray-700 mb-1">
              Event Type *
            </label>
            <select
              id="eventType"
              name="eventType"
              bind:value={eventType}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            >
              {#each eventTypes as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
          
          <div>
            <label for="tributeId" class="block text-sm font-medium text-gray-700 mb-1">
              Associated Tribute *
            </label>
            <select
              id="tributeId"
              name="tributeId"
              bind:value={tributeId}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="">Select a tribute</option>
              {#each tributes as tribute}
                <option value={tribute.id}>{tribute.attributes.lovedOnesFullName}</option>
              {/each}
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">
              Start Date and Time *
            </label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              bind:value={startDate}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">
              End Date and Time
            </label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              bind:value={endDate}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        
        <div class="mb-4">
          <label for="location" class="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            bind:value={location}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              bind:value={city}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label for="state" class="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              bind:value={state}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label for="zipCode" class="block text-sm font-medium text-gray-700 mb-1">
              Zip Code
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              bind:value={zipCode}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        
        {#if formError}
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{formError}</p>
          </div>
        {/if}
        
        <button
          type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Memorial Event
        </button>
      </form>
    </div>
  {:else}
    <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6" role="alert">
      <p>Please <a href="/login" class="underline font-medium">log in</a> to create a memorial event.</p>
    </div>
  {/if}
  
  <!-- Memorial Events List -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#if memorialEvents && memorialEvents.length > 0}
      {#each memorialEvents as event}
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="p-6">
            <div class="flex items-center mb-2">
              <span class="inline-block px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full mr-2">
                {event.attributes.eventType}
              </span>
              <h2 class="text-xl font-semibold">{event.attributes.title}</h2>
            </div>
            
            <div class="text-gray-600 mb-4">
              <p>For: {getTributeName(event.attributes.tribute)}</p>
              
              {#if event.attributes.startDate}
                <p>Starts: {formatDate(event.attributes.startDate)}</p>
              {/if}
              
              {#if event.attributes.endDate}
                <p>Ends: {formatDate(event.attributes.endDate)}</p>
              {/if}
              
              {#if event.attributes.location}
                <p>Location: {event.attributes.location}</p>
                {#if event.attributes.city || event.attributes.state}
                  <p>
                    {event.attributes.city || ''}
                    {event.attributes.city && event.attributes.state ? ', ' : ''}
                    {event.attributes.state || ''}
                    {event.attributes.zipCode ? ` ${event.attributes.zipCode}` : ''}
                  </p>
                {/if}
              {/if}
            </div>
            
            <a
              href={`/memorial-events/${event.id}`}
              class="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md"
            >
              View Details
            </a>
          </div>
        </div>
      {/each}
    {:else}
      <div class="col-span-full text-center p-8 bg-gray-50 rounded-lg">
        <p class="text-gray-600">No memorial events found. Create the first one!</p>
      </div>
    {/if}
  </div>
  
  <!-- Pagination -->
  {#if pagination && pagination.pageCount > 1}
    <div class="flex justify-center mt-8">
      <nav class="inline-flex rounded-md shadow-sm" aria-label="Pagination">
        <a 
          href={`/memorial-events?page=${Math.max(1, pagination.page - 1)}`}
          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          class:pointer-events-none={pagination.page === 1}
          class:opacity-50={pagination.page === 1}
        >
          <span class="sr-only">Previous</span>
          &larr;
        </a>
        
        {#each totalPages as page}
          <a
            href={`/memorial-events?page=${page}`}
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50"
            class:bg-blue-50={page === pagination.page}
            class:text-blue-600={page === pagination.page}
            class:border-blue-500={page === pagination.page}
            aria-current={page === pagination.page ? 'page' : undefined}
          >
            {page}
          </a>
        {/each}
        
        <a
          href={`/memorial-events?page=${Math.min(pagination.pageCount, pagination.page + 1)}`}
          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          class:pointer-events-none={pagination.page === pagination.pageCount}
          class:opacity-50={pagination.page === pagination.pageCount}
        >
          <span class="sr-only">Next</span>
          &rarr;
        </a>
      </nav>
    </div>
  {/if}
</div>