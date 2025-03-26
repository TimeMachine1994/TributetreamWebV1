<script lang="ts">
  // Define the available tabs
  const tabs = [
    { id: 'tribute-pages', label: 'Tribute Pages' },
    { id: 'funeral-homes', label: 'Funeral Homes' },
    { id: 'locations', label: 'Locations' },
    { id: 'events', label: 'Events' },
    { id: 'schedules', label: 'Schedules' }
  ];
  
  // Active tab state
  let activeTab = $state(tabs[0].id);
  
  // Data states
  let tributePages = $state<any[]>([]);
  let funeralHomes = $state<any[]>([]);
  let locations = $state<any[]>([]);
  let events = $state<any[]>([]);
  let schedules = $state<any[]>([]);
  
  // Loading states
  let loading = $state({
    tributePages: false,
    funeralHomes: false,
    locations: false,
    events: false,
    schedules: false
  });
  
  // Error states
  let errors = $state({
    tributePages: '',
    funeralHomes: '',
    locations: '',
    events: '',
    schedules: ''
  });
  
  // Fetch data based on active tab
  $effect(() => {
    if (activeTab === 'tribute-pages') {
      fetchTributePages();
    } else if (activeTab === 'funeral-homes') {
      fetchFuneralHomes();
    } else if (activeTab === 'locations') {
      fetchLocations();
    } else if (activeTab === 'events') {
      fetchEvents();
    } else if (activeTab === 'schedules') {
      fetchSchedules();
    }
  });
  
  // Fetch functions
  async function fetchTributePages() {
    if (tributePages.length > 0) return; // Already loaded
    
    loading.tributePages = true;
    errors.tributePages = '';
    
    try {
      const response = await fetch('/api/tribute');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch tribute pages');
      }
      
      tributePages = await response.json();
    } catch (err) {
      if (err instanceof Error) {
        errors.tributePages = err.message;
      } else {
        errors.tributePages = 'An unexpected error occurred';
      }
    } finally {
      loading.tributePages = false;
    }
  }
  
  async function fetchFuneralHomes() {
    if (funeralHomes.length > 0) return; // Already loaded
    
    loading.funeralHomes = true;
    errors.funeralHomes = '';
    
    try {
      const response = await fetch('/api/tribute/funeral-homes');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch funeral homes');
      }
      
      funeralHomes = await response.json();
    } catch (err) {
      if (err instanceof Error) {
        errors.funeralHomes = err.message;
      } else {
        errors.funeralHomes = 'An unexpected error occurred';
      }
    } finally {
      loading.funeralHomes = false;
    }
  }
  
  async function fetchLocations() {
    if (locations.length > 0) return; // Already loaded
    
    loading.locations = true;
    errors.locations = '';
    
    try {
      const response = await fetch('/api/tribute/locations');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch locations');
      }
      
      locations = await response.json();
    } catch (err) {
      if (err instanceof Error) {
        errors.locations = err.message;
      } else {
        errors.locations = 'An unexpected error occurred';
      }
    } finally {
      loading.locations = false;
    }
  }
  
  async function fetchEvents() {
    if (events.length > 0) return; // Already loaded
    
    loading.events = true;
    errors.events = '';
    
    try {
      const response = await fetch('/api/tribute/events');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch events');
      }
      
      events = await response.json();
    } catch (err) {
      if (err instanceof Error) {
        errors.events = err.message;
      } else {
        errors.events = 'An unexpected error occurred';
      }
    } finally {
      loading.events = false;
    }
  }
  
  async function fetchSchedules() {
    if (schedules.length > 0) return; // Already loaded
    
    loading.schedules = true;
    errors.schedules = '';
    
    try {
      const response = await fetch('/api/tribute/schedules');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch schedules');
      }
      
      schedules = await response.json();
    } catch (err) {
      if (err instanceof Error) {
        errors.schedules = err.message;
      } else {
        errors.schedules = 'An unexpected error occurred';
      }
    } finally {
      loading.schedules = false;
    }
  }
</script>

<div class="py-6">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
    <p class="mt-2 text-sm text-gray-700">
      Manage all your Tributestream data from this dashboard.
    </p>
  </div>
  
  <div class="mt-6 sm:mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        {#each tabs as tab}
          <button
            class={`${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            on:click={() => activeTab = tab.id}
          >
            {tab.label}
          </button>
        {/each}
      </nav>
    </div>
    
    <div class="mt-6">
      <!-- Tab Content -->
      {#if activeTab === 'tribute-pages'}
        <div>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Tribute Pages</h2>
            <button class="bg-indigo-600 text-white px-4 py-2 rounded">Add New</button>
          </div>
          
          {#if loading.tributePages}
            <p>Loading...</p>
          {:else if errors.tributePages}
            <p class="text-red-500">{errors.tributePages}</p>
          {:else if tributePages.length === 0}
            <p>No tribute pages found.</p>
          {:else}
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>DOB</th>
                  <th>DOD</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each tributePages as page}
                  <tr>
                    <td>{page.tribute_id}</td>
                    <td>{page.loved_ones_name}</td>
                    <td>{page.loved_ones_dob || 'N/A'}</td>
                    <td>{page.loved_ones_dod || 'N/A'}</td>
                    <td>
                      <button class="text-indigo-600">Edit</button>
                      <button class="text-red-600 ml-2">Delete</button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
        </div>
      {/if}
      
      <!-- Similar blocks for other tabs -->
      {#if activeTab === 'funeral-homes'}
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Funeral Homes</h2>
          <!-- Similar content as tribute pages -->
        </div>
      {/if}
      
      {#if activeTab === 'locations'}
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Locations</h2>
          <!-- Similar content as tribute pages -->
        </div>
      {/if}
      
      {#if activeTab === 'events'}
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Events</h2>
          <!-- Similar content as tribute pages -->
        </div>
      {/if}
      
      {#if activeTab === 'schedules'}
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Schedules</h2>
          <!-- Similar content as tribute pages -->
        </div>
      {/if}
    </div>
  </div>
</div>
