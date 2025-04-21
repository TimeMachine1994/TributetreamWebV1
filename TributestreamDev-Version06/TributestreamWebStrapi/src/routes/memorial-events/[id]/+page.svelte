<script lang="ts">
  import { formatDate, formatDateTime } from '$lib/utils/format';
  import type { MemorialEvent, MemorialEventAttributes } from '$lib/types/strapi.types';

  interface PageData {
    memorialEvent: MemorialEvent;
    tribute?: any;
    error?: string;
  }

  export let data: PageData;
  const { memorialEvent, tribute } = data;
  
  // Extract the event attributes for easier access
  const event = memorialEvent.attributes;
</script>

<svelte:head>
  <title>{event.title || 'Memorial Event'} | TributeStream</title>
  <meta name="description" content="Memorial event details for {event.title}" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="mb-6">
    <a href="/memorial-events" class="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Memorial Events</a>
    
    {#if tribute}
      <a href="/tributes/{tribute.id}" class="text-blue-600 hover:underline ml-4 inline-block">
        View Associated Tribute
      </a>
    {/if}
  </div>

  <div class="bg-white shadow-md rounded-lg overflow-hidden">
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">{event.title || 'Memorial Event'}</h1>
      
      {#if event.description}
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Description</h2>
          <p class="text-gray-600">{event.description}</p>
        </div>
      {/if}
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Event Details</h2>
          <div class="space-y-2">
            {#if event.startDate}
              <p><span class="font-medium">Start Date:</span> {formatDateTime(event.startDate, 'date')}</p>
            {/if}
            
            {#if event.endDate}
              <p><span class="font-medium">End Date:</span> {formatDateTime(event.endDate, 'date')}</p>
            {/if}
            
            {#if event.eventType}
              <p><span class="font-medium">Event Type:</span> {event.eventType}</p>
            {/if}
          </div>
        </div>
        
        <div>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Location</h2>
          <div class="space-y-2">
            {#if event.location}
              <p><span class="font-medium">Location:</span> {event.location}</p>
            {/if}
            
            {#if event.city}
              <p>
                <span class="font-medium">City:</span> {event.city}
                {#if event.state}
                  , {event.state}
                {/if}
                {#if event.zipCode}
                  {event.zipCode}
                {/if}
              </p>
            {/if}
          </div>
        </div>
      </div>
      
      <div class="mt-8 flex justify-between items-center">
        <span class="text-sm text-gray-500">
          Created: {event.createdAt ? formatDateTime(event.createdAt, 'datetime') : 'N/A'}
        </span>
        
        {#if event.updatedAt && event.updatedAt !== event.createdAt}
          <span class="text-sm text-gray-500">
            Last Updated: {formatDateTime(event.updatedAt, 'datetime')}
          </span>
        {/if}
      </div>
    </div>
  </div>
</div>