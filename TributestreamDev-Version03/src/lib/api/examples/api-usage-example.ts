/**
 * API Usage Examples
 * 
 * This file contains examples of how to use the new API clients in components.
 * These examples are for reference only and are not meant to be used directly.
 */

import { 
  tributeApi, 
  eventsApi, 
  locationsApi, 
  usersApi, 
  funeralHomesApi, 
  schedulesApi 
} from '$lib/api';

/**
 * Example: Fetching tributes for the current user
 */
async function fetchUserTributes() {
  // First get the current user
  const userResponse = await usersApi.getCurrentUser();
  
  if (!userResponse.success || !userResponse.data) {
    console.error('Failed to get current user:', userResponse.error);
    return [];
  }
  
  // Then get tributes for the user
  const userId = userResponse.data?.data?.id;
  const tributesResponse = await usersApi.getTributesByUser(userId);
  
  if (!tributesResponse.success || !tributesResponse.data) {
    console.error('Failed to get tributes:', tributesResponse.error);
    return [];
  }
  
  return tributesResponse.data;
}

/**
 * Example: Fetching active events
 */
async function fetchActiveEvents() {
  const response = await eventsApi.getActiveEvents();
  
  if (!response.success || !response.data) {
    console.error('Failed to get active events:', response.error);
    return [];
  }
  
  return response.data;
}

/**
 * Example: Creating a new tribute
 */
async function createNewTribute(data: {
  created_by_user_id: number;
  loved_ones_name: string;
  point_of_contact_user_id?: number;
  page_html?: string;
  loved_ones_dob?: string;
  loved_ones_dod?: string;
}) {
  const response = await tributeApi.createTribute(data);
  
  if (!response.success || !response.data) {
    console.error('Failed to create tribute:', response.error);
    return null;
  }
  
  return response.data;
}

/**
 * Example: Fetching locations for a tribute and their events
 */
async function fetchLocationsWithEvents(tributeId: number) {
  // Get locations for the tribute
  const locationsResponse = await locationsApi.getLocationsByTribute(tributeId);
  
  if (!locationsResponse.success || !locationsResponse.data) {
    console.error('Failed to get locations:', locationsResponse.error);
    return [];
  }
  
  // For each location, get its events
  const locationsWithEvents = await Promise.all(
    locationsResponse.data.map(async (location: any) => {
      const eventsResponse = await eventsApi.getEventsByLocation(location.location_id);
      
      const events = eventsResponse.success && eventsResponse.data 
        ? eventsResponse.data
        : [];
      
      return {
        ...location,
        events
      };
    })
  );
  
  return locationsWithEvents;
}

/**
 * Example: Creating a schedule for a tribute
 */
async function createSchedule(tributeId: number, funeralDirectorId: number, numberOfDays: number) {
  const response = await schedulesApi.createSchedule({
    tribute_id: tributeId,
    funeral_director_user_id: funeralDirectorId,
    number_of_days: numberOfDays
  });
  
  if (!response.success || !response.data) {
    console.error('Failed to create schedule:', response.error);
    return null;
  }
  
  return response.data;
}

/**
 * Example: Getting funeral homes
 */
async function getFuneralHomes() {
  const response = await funeralHomesApi.getAllFuneralHomes();
  
  if (!response.success || !response.data) {
    console.error('Failed to get funeral homes:', response.error);
    return [];
  }
  
  return response.data.funeral_homes;
}

/**
 * Example: Using the API in a SvelteKit load function
 */
/*
// In a +page.server.ts file:
import { eventsApi, locationsApi } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const tributeId = parseInt(params.id);
  
  // Get locations with events
  const locationsWithEvents = await fetchLocationsWithEvents(tributeId);
  
  // Get active events
  const activeEvents = await eventsApi.getActiveEvents();
  
  return {
    locationsWithEvents,
    activeEvents: activeEvents.success ? activeEvents.data.events : []
  };
};

// In the corresponding +page.svelte file:
<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  const { locationsWithEvents, activeEvents } = data;
</script>

<h1>Locations and Events</h1>

{#each locationsWithEvents as location}
  <div class="location">
    <h2>{location.location_name}</h2>
    <p>{location.location_address}</p>
    
    <h3>Events</h3>
    {#if location.events.length > 0}
      <ul>
        {#each location.events as event}
          <li>
            {new Date(event.start_time).toLocaleString()} - 
            {new Date(event.end_time).toLocaleString()}
          </li>
        {/each}
      </ul>
    {:else}
      <p>No events scheduled at this location.</p>
    {/if}
  </div>
{/each}

<h2>Active Events</h2>
{#if activeEvents.length > 0}
  <ul>
    {#each activeEvents as event}
      <li>
        {new Date(event.start_time).toLocaleString()} - 
        {new Date(event.end_time).toLocaleString()}
      </li>
    {/each}
  </ul>
{:else}
  <p>No active events.</p>
{/if}
*/

// Export the example functions for reference
export {
  fetchUserTributes,
  fetchActiveEvents,
  createNewTribute,
  fetchLocationsWithEvents,
  createSchedule,
  getFuneralHomes
};