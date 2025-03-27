<script lang="ts">
  import type { PageData } from './$types';
  import type { Tribute } from '$lib/types/tribute';
  import UserDataWidget from '$lib/components/dashboard/UserDataWidget.svelte';
  import EnhancedUserDataWidget from '$lib/components/dashboard/EnhancedUserDataWidget.svelte';

  let { data } = $props<{ data: PageData }>();
  
  // Pagination state
  let currentPage = $state(1);
  let itemsPerPage = $state(5);
  
  // Computed properties for pagination
  let totalPages = $derived(Math.ceil((data.tributes?.length || 0) / itemsPerPage));
  let paginatedTributes = $derived(data.tributes
    ? data.tributes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : []);
  
  // Pagination controls
  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++;
    }
  }
  
  function prevPage() {
    if (currentPage > 1) {
      currentPage--;
    }
  }
  
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }
  
  // Format date for display
  function formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Create tribute URL from slug
  function getTributeUrl(slug: string): string {
    return `/celebration-of-life-for-${slug}`;
  }

  // Get the user's name for display
  function getUserName() {
    console.log('User data:', data.user);
    // Simple and direct approach
    if (data.user?.email) {
      return data.user.email.split('@')[0];
    }
    return 'User';
  }

  // Define the API tribute interface which might differ from our local type
  interface ApiTribute {
    ID: number;
    slug: string;
    loved_one_name: string;
    created_at: string;
    updated_at: string;
    custom_html?: string;
    phone_number: string;
    number_of_streams?: number;
    [key: string]: any; // Allow additional properties
  }

  // Get detailed tribute by ID
  function getDetailedTribute(tributeId: number): ApiTribute | null {
    if (!data.detailedTributes || data.detailedTributes.length === 0) return null;
    return data.detailedTributes.find((t: ApiTribute) => t.ID === tributeId) || null;
  }
  
  // Get user ID as a number for the UserDataWidget
  function getUserId(): number {
    if (!data.user || !data.user.id) return 0;
    return typeof data.user.id === 'string' ? parseInt(data.user.id, 10) : data.user.id;
  }
</script>

<svelte:head>
  <title>My Dashboard | Tributestream</title>
  <meta name="description" content="Manage your Tributestream memorials and account information." />
</svelte:head>

<div class="bg-gray-50 min-h-screen">
  <main class="container mx-auto px-4 py-8">
    <!-- Welcome section -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Welcome, {getUserName()}</h1>
      <p class="text-gray-600 mt-2">Manage your memorial tributes and information from your personal dashboard.</p>
    </div>

    {#if data.error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
        <p>{data.error}</p>
      </div>
    {/if}

    <div class="grid md:grid-cols-2 gap-8">
      <!-- Tributes section -->
      <section class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h2 class="text-xl font-semibold text-gray-800">
            {#if data.isAdmin}
              All Tributes
              <span class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Admin View</span>
            {:else}
              My Tributes
            {/if}
          </h2>
        </div>
        
        <div class="p-6">
          {#if data.tributes && data.tributes.length > 0}
            <div class="space-y-6">
              {#each paginatedTributes as tribute}
                {@const detailedTribute = getDetailedTribute(tribute.ID)}
                <div class="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <h3 class="text-lg font-semibold text-primary">{tribute.loved_one_name || 'Unnamed Tribute'}</h3>
                  
                  <div class="mt-2 grid gap-2">
                    {#if tribute.created_at}
                      <p class="text-sm text-gray-500">Created: {formatDate(tribute.created_at)}</p>
                    {/if}
                    
                    {#if tribute.updated_at && tribute.updated_at !== tribute.created_at}
                      <p class="text-sm text-gray-500">Last updated: {formatDate(tribute.updated_at)}</p>
                    {/if}
                    
                    {#if detailedTribute?.number_of_streams !== undefined}
                      <p class="text-sm text-gray-600">
                        <span class="font-medium">Views:</span> {detailedTribute.number_of_streams}
                      </p>
                    {/if}
                    
                    <!-- Additional details from the detailed tribute data -->
                    {#if detailedTribute}
                      {#if detailedTribute.extended_data}
                        <div class="mt-2 pt-2 border-t border-gray-100">
                          <h4 class="text-sm font-medium text-gray-700">Additional Information</h4>
                          <div class="mt-1 grid grid-cols-1 gap-1">
                            {#each Object.entries(detailedTribute.extended_data) as [key, value]}
                              {#if value && typeof value === 'string'}
                                <p class="text-xs text-gray-500">
                                  <span class="font-medium">{key.replace(/_/g, ' ')}:</span> {value}
                                </p>
                              {/if}
                            {/each}
                          </div>
                        </div>
                      {/if}
                    {/if}
                  </div>
                  
                  <div class="mt-4 flex space-x-3">
                    <a
                      href={getTributeUrl(tribute.slug)}
                      class="inline-flex items-center px-3 py-1.5 border border-primary text-primary bg-transparent rounded-md text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      View Tribute
                    </a>
                    <a
                      href="/my-portal/edit-form"
                      class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 bg-transparent rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Edit Information
                    </a>
                  </div>
                </div>
              {/each}
              
              <!-- Pagination controls -->
              {#if totalPages > 1}
                <div class="flex justify-center items-center mt-6 pt-4 border-t border-gray-100">
                  <nav class="flex items-center space-x-2" aria-label="Pagination">
                    <button
                      class="px-2 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      on:click={prevPage}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <span class="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      class="px-2 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      on:click={nextPage}
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </nav>
                </div>
              {/if}
            </div>
          {:else}
            <div class="text-center py-6">
              <p class="text-gray-500">
                {#if data.isAdmin}
                  No tributes found in the system.
                {:else}
                  You don't have any tributes yet.
                {/if}
              </p>
            </div>
          {/if}
        </div>
      </section>

      <!-- Memorial Information using the enhanced widget with events -->
      <EnhancedUserDataWidget userId={getUserId()} />
    </div>

    <!-- Account Settings -->
    <section class="bg-white rounded-lg shadow overflow-hidden mt-8">
      <div class="px-6 py-5 border-b border-gray-200 bg-gray-50">
        <h2 class="text-xl font-semibold text-gray-800">Account Settings</h2>
      </div>
      
      <div class="p-6">
        <div class="mb-4">
          <h3 class="text-lg font-medium text-gray-900">Your Account</h3>
          <p class="text-gray-600 mt-1">Email: {data.user?.email || 'Not available'}</p>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <form method="POST" action="/api/auth/logout">
            <button 
              type="submit"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </section>
  </main>
</div>