<script lang="ts">
  import { onMount } from 'svelte';
  import { eventsPersistence } from '$lib/persistence/events-persistence';
  import { funeralHomesPersistence } from '$lib/persistence/funeral-homes-persistence';
  import { schedulesPersistence } from '$lib/persistence/schedules-persistence';
  import { tributePersistence } from '$lib/persistence/tribute-persistence';
  import { tributeApiV2 } from '$lib/api/tribute-api-client-v2';
  
  // State variables
  let userId = 1;
  let tributeId = 1;
  let locationId = 1;
  let scheduleId = 1;
  let funeralHomeId = 1;
  
  let token = '';
  let isLoggedIn = false;
  
  // Test results
  let tributeResults: any = null;
  let eventsResults: any = null;
  let funeralHomesResults: any = null;
  let schedulesResults: any = null;
  
  // Loading states
  let loadingTributes = false;
  let loadingEvents = false;
  let loadingFuneralHomes = false;
  let loadingSchedules = false;
  
  onMount(() => {
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      token = storedToken;
      isLoggedIn = true;
      tributeApiV2.setToken(token);
    }
  });
  
  // Login function
  function login() {
    if (token) {
      tributeApiV2.setToken(token);
      localStorage.setItem('jwt_token', token);
      isLoggedIn = true;
    }
  }
  
  // Logout function
  function logout() {
    localStorage.removeItem('jwt_token');
    token = '';
    isLoggedIn = false;
  }
  
  // Test tribute persistence
  async function testTributePersistence() {
    loadingTributes = true;
    tributeResults = null;
    
    try {
      // Get tributes for user
      const tributesResult = await tributePersistence.getTributesByUser(userId);
      
      // Get tribute by ID
      const tributeResult = await tributePersistence.getTributeById(tributeId);
      
      // Get form data
      const formDataResult = await tributePersistence.getFormData(userId);
      
      tributeResults = {
        tributes: tributesResult,
        tribute: tributeResult,
        formData: formDataResult
      };
    } catch (error) {
      tributeResults = { error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      loadingTributes = false;
    }
  }
  
  // Test events persistence
  async function testEventsPersistence() {
    loadingEvents = true;
    eventsResults = null;
    
    try {
      // Get active events
      const activeEventsResult = await eventsPersistence.getActiveEvents();
      
      // Get events for location
      const locationEventsResult = await eventsPersistence.getEventsByLocation(locationId);
      
      // Get events for tribute
      const tributeEventsResult = await eventsPersistence.getEventsByTribute(tributeId);
      
      eventsResults = {
        activeEvents: activeEventsResult,
        locationEvents: locationEventsResult,
        tributeEvents: tributeEventsResult
      };
    } catch (error) {
      eventsResults = { error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      loadingEvents = false;
    }
  }
  
  // Test funeral homes persistence
  async function testFuneralHomesPersistence() {
    loadingFuneralHomes = true;
    funeralHomesResults = null;
    
    try {
      // Get all funeral homes
      const homesResult = await funeralHomesPersistence.getFuneralHomes();
      
      // Get funeral home by ID
      const homeResult = await funeralHomesPersistence.getFuneralHomeById(funeralHomeId);
      
      funeralHomesResults = {
        homes: homesResult,
        home: homeResult
      };
    } catch (error) {
      funeralHomesResults = { error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      loadingFuneralHomes = false;
    }
  }
  
  // Test schedules persistence
  async function testSchedulesPersistence() {
    loadingSchedules = true;
    schedulesResults = null;
    
    try {
      // Get all schedules
      const schedulesResult = await schedulesPersistence.getSchedules();
      
      // Get schedules for tribute
      const tributeSchedulesResult = await schedulesPersistence.getSchedules({ tributeId });
      
      // Get schedule by ID
      const scheduleResult = await schedulesPersistence.getScheduleById(scheduleId);
      
      schedulesResults = {
        schedules: schedulesResult,
        tributeSchedules: tributeSchedulesResult,
        schedule: scheduleResult
      };
    } catch (error) {
      schedulesResults = { error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      loadingSchedules = false;
    }
  }
  
  // Format JSON for display
  function formatJSON(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }
</script>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-6">Persistence Layer Testing</h1>
  
  <!-- Authentication -->
  <div class="bg-card rounded-lg p-4 mb-6 shadow-sm">
    <h2 class="text-xl font-semibold mb-2">Authentication</h2>
    
    {#if isLoggedIn}
      <div class="flex items-center mb-4">
        <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm mr-2">Logged In</span>
        <button 
          class="bg-destructive text-destructive-foreground px-3 py-1 rounded-md text-sm"
          on:click={logout}
        >
          Logout
        </button>
      </div>
    {:else}
      <div class="flex items-center mb-4">
        <input 
          type="text" 
          bind:value={token} 
          placeholder="Enter JWT token" 
          class="border border-input rounded-md px-3 py-1 mr-2 flex-grow"
        />
        <button 
          class="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm"
          on:click={login}
        >
          Login
        </button>
      </div>
    {/if}
  </div>
  
  <!-- Test Parameters -->
  <div class="bg-card rounded-lg p-4 mb-6 shadow-sm">
    <h2 class="text-xl font-semibold mb-2">Test Parameters</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div>
        <label class="block text-sm text-muted-foreground mb-1">User ID</label>
        <input 
          type="number" 
          bind:value={userId} 
          class="border border-input rounded-md px-3 py-1 w-full"
        />
      </div>
      
      <div>
        <label class="block text-sm text-muted-foreground mb-1">Tribute ID</label>
        <input 
          type="number" 
          bind:value={tributeId} 
          class="border border-input rounded-md px-3 py-1 w-full"
        />
      </div>
      
      <div>
        <label class="block text-sm text-muted-foreground mb-1">Location ID</label>
        <input 
          type="number" 
          bind:value={locationId} 
          class="border border-input rounded-md px-3 py-1 w-full"
        />
      </div>
      
      <div>
        <label class="block text-sm text-muted-foreground mb-1">Schedule ID</label>
        <input 
          type="number" 
          bind:value={scheduleId} 
          class="border border-input rounded-md px-3 py-1 w-full"
        />
      </div>
      
      <div>
        <label class="block text-sm text-muted-foreground mb-1">Funeral Home ID</label>
        <input 
          type="number" 
          bind:value={funeralHomeId} 
          class="border border-input rounded-md px-3 py-1 w-full"
        />
      </div>
    </div>
  </div>
  
  <!-- Test Buttons -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <button 
      class="bg-primary text-primary-foreground px-4 py-2 rounded-md"
      on:click={testTributePersistence}
      disabled={loadingTributes || !isLoggedIn}
    >
      {#if loadingTributes}
        Testing Tributes...
      {:else}
        Test Tribute Persistence
      {/if}
    </button>
    
    <button 
      class="bg-primary text-primary-foreground px-4 py-2 rounded-md"
      on:click={testEventsPersistence}
      disabled={loadingEvents || !isLoggedIn}
    >
      {#if loadingEvents}
        Testing Events...
      {:else}
        Test Events Persistence
      {/if}
    </button>
    
    <button 
      class="bg-primary text-primary-foreground px-4 py-2 rounded-md"
      on:click={testFuneralHomesPersistence}
      disabled={loadingFuneralHomes || !isLoggedIn}
    >
      {#if loadingFuneralHomes}
        Testing Funeral Homes...
      {:else}
        Test Funeral Homes Persistence
      {/if}
    </button>
    
    <button 
      class="bg-primary text-primary-foreground px-4 py-2 rounded-md"
      on:click={testSchedulesPersistence}
      disabled={loadingSchedules || !isLoggedIn}
    >
      {#if loadingSchedules}
        Testing Schedules...
      {:else}
        Test Schedules Persistence
      {/if}
    </button>
  </div>
  
  <!-- Results -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Tribute Results -->
    {#if tributeResults}
      <div class="bg-card rounded-lg p-4 shadow-sm">
        <h2 class="text-xl font-semibold mb-2">Tribute Results</h2>
        
        {#if tributeResults.error}
          <div class="bg-destructive/10 text-destructive p-3 rounded-md">
            {tributeResults.error}
          </div>
        {:else}
          <div class="overflow-auto max-h-96">
            <pre class="text-xs">{formatJSON(tributeResults)}</pre>
          </div>
        {/if}
      </div>
    {/if}
    
    <!-- Events Results -->
    {#if eventsResults}
      <div class="bg-card rounded-lg p-4 shadow-sm">
        <h2 class="text-xl font-semibold mb-2">Events Results</h2>
        
        {#if eventsResults.error}
          <div class="bg-destructive/10 text-destructive p-3 rounded-md">
            {eventsResults.error}
          </div>
        {:else}
          <div class="overflow-auto max-h-96">
            <pre class="text-xs">{formatJSON(eventsResults)}</pre>
          </div>
        {/if}
      </div>
    {/if}
    
    <!-- Funeral Homes Results -->
    {#if funeralHomesResults}
      <div class="bg-card rounded-lg p-4 shadow-sm">
        <h2 class="text-xl font-semibold mb-2">Funeral Homes Results</h2>
        
        {#if funeralHomesResults.error}
          <div class="bg-destructive/10 text-destructive p-3 rounded-md">
            {funeralHomesResults.error}
          </div>
        {:else}
          <div class="overflow-auto max-h-96">
            <pre class="text-xs">{formatJSON(funeralHomesResults)}</pre>
          </div>
        {/if}
      </div>
    {/if}
    
    <!-- Schedules Results -->
    {#if schedulesResults}
      <div class="bg-card rounded-lg p-4 shadow-sm">
        <h2 class="text-xl font-semibold mb-2">Schedules Results</h2>
        
        {#if schedulesResults.error}
          <div class="bg-destructive/10 text-destructive p-3 rounded-md">
            {schedulesResults.error}
          </div>
        {:else}
          <div class="overflow-auto max-h-96">
            <pre class="text-xs">{formatJSON(schedulesResults)}</pre>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>