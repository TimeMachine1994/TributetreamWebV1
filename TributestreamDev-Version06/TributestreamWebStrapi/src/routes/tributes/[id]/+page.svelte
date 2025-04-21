<script lang="ts">
  import type { Tribute, MemorialEvent } from '$lib/types/strapi.types';

  export let data: {
    tribute: Tribute;
    memorialEvents: MemorialEvent[];
  };

  // Format date to a more readable format
  function formatDate(dateString?: string): string {
    if (!dateString) return 'Not provided';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  }

  // Format time to a more readable format
  function formatTime(dateString?: string): string {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<svelte:head>
  <title>Tribute for {data.tribute.attributes.lovedOnesFullName}</title>
  <meta name="description" content="Memorial tribute for {data.tribute.attributes.lovedOnesFullName}" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <a href="/tributes" class="text-blue-600 hover:text-blue-800 mb-4 inline-block">
    &larr; Back to Tributes
  </a>
  
  <!-- Main Tribute Information -->
  <div class="bg-white shadow-md rounded-lg p-6 mb-8">
    <h1 class="text-3xl font-bold mb-2">{data.tribute.attributes.lovedOnesFullName}</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div>
        <p class="text-gray-600">
          <span class="font-semibold">Date of Birth:</span> 
          {formatDate(data.tribute.attributes.lovedOnesDOB)}
        </p>
        <p class="text-gray-600">
          <span class="font-semibold">Date of Passing:</span> 
          {formatDate(data.tribute.attributes.dateOfPassing)}
        </p>
      </div>
      
      {#if data.tribute.attributes.package?.data}
        <div>
          <p class="text-gray-600">
            <span class="font-semibold">Package:</span> 
            {data.tribute.attributes.package.data.attributes.name}
          </p>
          <p class="text-gray-600">
            <span class="font-semibold">Price:</span> 
            ${data.tribute.attributes.package.data.attributes.price.toFixed(2)}
          </p>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Funeral Home Information (if available) -->
  {#if data.tribute.attributes.funeralHome?.data}
    <div class="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 class="text-2xl font-bold mb-4">Funeral Home</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-gray-600">
            <span class="font-semibold">Name:</span> 
            {data.tribute.attributes.funeralHome.data.attributes.name}
          </p>
          
          {#if data.tribute.attributes.funeralHome.data.attributes.phone}
            <p class="text-gray-600">
              <span class="font-semibold">Phone:</span> 
              {data.tribute.attributes.funeralHome.data.attributes.phone}
            </p>
          {/if}
          
          {#if data.tribute.attributes.funeralHome.data.attributes.website}
            <p class="text-gray-600">
              <span class="font-semibold">Website:</span> 
              <a href={data.tribute.attributes.funeralHome.data.attributes.website} 
                 class="text-blue-600 hover:text-blue-800" 
                 target="_blank" 
                 rel="noopener noreferrer">
                {data.tribute.attributes.funeralHome.data.attributes.website}
              </a>
            </p>
          {/if}
        </div>
        
        <div>
          {#if data.tribute.attributes.funeralHome.data.attributes.address}
            <p class="text-gray-600">
              <span class="font-semibold">Address:</span><br>
              {data.tribute.attributes.funeralHome.data.attributes.address}<br>
              {data.tribute.attributes.funeralHome.data.attributes.city || ''}, 
              {data.tribute.attributes.funeralHome.data.attributes.state || ''} 
              {data.tribute.attributes.funeralHome.data.attributes.zipCode || ''}
            </p>
          {/if}
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Package Details (if available) -->
  {#if data.tribute.attributes.package?.data}
    <div class="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 class="text-2xl font-bold mb-4">Package Details</h2>
      
      <p class="text-gray-600">
        <span class="font-semibold">Name:</span> 
        {data.tribute.attributes.package.data.attributes.name}
      </p>
      
      {#if data.tribute.attributes.package.data.attributes.description}
        <p class="text-gray-600 mt-2">
          <span class="font-semibold">Description:</span><br>
          {data.tribute.attributes.package.data.attributes.description}
        </p>
      {/if}
      
      {#if data.tribute.attributes.package.data.attributes.features && data.tribute.attributes.package.data.attributes.features.length > 0}
        <div class="mt-4">
          <p class="font-semibold text-gray-600">Features:</p>
          <ul class="list-disc pl-5 mt-2">
            {#each data.tribute.attributes.package.data.attributes.features as feature}
              <li class="text-gray-600">{feature}</li>
            {/each}
          </ul>
        </div>
      {/if}
      
      <p class="text-gray-600 mt-4">
        <span class="font-semibold">Price:</span> 
        ${data.tribute.attributes.package.data.attributes.price.toFixed(2)}
      </p>
    </div>
  {/if}
  
  <!-- Memorial Events -->
  <div class="bg-white shadow-md rounded-lg p-6">
    <h2 class="text-2xl font-bold mb-4">Memorial Events</h2>
    
    {#if data.memorialEvents && data.memorialEvents.length > 0}
      <div class="grid grid-cols-1 gap-6">
        {#each data.memorialEvents as event}
          <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="text-xl font-semibold mb-2">{event.attributes.title}</h3>
            
            <p class="text-gray-600 mb-2">
              <span class="font-semibold">Type:</span> 
              {event.attributes.eventType.charAt(0).toUpperCase() + event.attributes.eventType.slice(1).replace('-', ' ')}
            </p>
            
            <div class="mb-2">
              <p class="text-gray-600">
                <span class="font-semibold">Date:</span> 
                {formatDate(event.attributes.startDate)}
              </p>
              <p class="text-gray-600">
                <span class="font-semibold">Time:</span> 
                {formatTime(event.attributes.startDate)}
                {#if event.attributes.endDate}
                  - {formatTime(event.attributes.endDate)}
                {/if}
              </p>
            </div>
            
            {#if event.attributes.location}
              <p class="text-gray-600">
                <span class="font-semibold">Location:</span> 
                {event.attributes.location}<br>
                {event.attributes.city || ''}, 
                {event.attributes.state || ''} 
                {event.attributes.zipCode || ''}
              </p>
            {/if}
            
            {#if event.attributes.description}
              <p class="text-gray-600 mt-2">
                <span class="font-semibold">Description:</span><br>
                {event.attributes.description}
              </p>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-gray-600">No memorial events have been scheduled yet.</p>
    {/if}
  </div>
</div>