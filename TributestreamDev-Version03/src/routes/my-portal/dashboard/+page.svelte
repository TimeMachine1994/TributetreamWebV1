<script lang="ts">
  import type { PageData } from './$types';
  import type { Tribute } from '$lib/types/tribute';

  let { data } = $props<{ data: PageData }>();
  
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
          <h2 class="text-xl font-semibold text-gray-800">My Tributes</h2>
        </div>
        
        <div class="p-6">
          {#if data.tributes && data.tributes.length > 0}
            <div class="space-y-6">
              {#each data.tributes as tribute}
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
            </div>
          {:else}
            <div class="text-center py-6">
              <p class="text-gray-500">You don't have any tributes yet.</p>
            </div>
          {/if}
        </div>
      </section>

      <!-- Memorial Form Info -->
      <section class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h2 class="text-xl font-semibold text-gray-800">Memorial Information</h2>
        </div>
        
        <div class="p-6">
          {#if data.hasMemorialData}
            <div class="mb-4">
              <h3 class="text-lg font-medium text-gray-900">Deceased Information</h3>
              <p class="text-gray-600 mt-1">
                {data.memorialData.deceased?.firstName || ''} {data.memorialData.deceased?.lastName || ''}
              </p>
              {#if data.memorialData.deceased?.dob}
                <p class="text-sm text-gray-500">Birth Date: {formatDate(data.memorialData.deceased.dob)}</p>
              {/if}
              {#if data.memorialData.deceased?.dop}
                <p class="text-sm text-gray-500">Passing Date: {formatDate(data.memorialData.deceased.dop)}</p>
              {/if}
            </div>
            
            <div class="mb-4">
              <h3 class="text-lg font-medium text-gray-900">Memorial Information</h3>
              {#if data.memorialData.memorial?.locationName || data.memorialData.memorial?.locationAddress}
                <p class="text-gray-600 mt-1">
                  {data.memorialData.memorial?.locationName || ''}
                  {#if data.memorialData.memorial?.locationAddress}
                    <span class="text-sm text-gray-500 block">{data.memorialData.memorial.locationAddress}</span>
                  {/if}
                </p>
              {/if}
              
              {#if data.memorialData.memorial?.date}
                <p class="text-sm text-gray-500">
                  Date: {formatDate(data.memorialData.memorial.date)}
                  {#if data.memorialData.memorial?.time}
                    <span class="ml-2">at {data.memorialData.memorial.time}</span>
                  {/if}
                </p>
              {/if}
            </div>
            
            <div class="mt-6">
              <a 
                href="/my-portal/edit-form" 
                class="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Edit Memorial Information
              </a>
            </div>
          {:else}
            <div class="text-center py-6">
              <p class="text-gray-500 mb-4">You haven't filled out memorial information yet.</p>
              <a 
                href="/my-portal/edit-form" 
                class="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Create Memorial Information
              </a>
            </div>
          {/if}
        </div>
      </section>
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