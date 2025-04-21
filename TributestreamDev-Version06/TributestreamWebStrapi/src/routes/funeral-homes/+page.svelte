<script lang="ts">
  import type { FuneralHome } from '$lib/types/strapi.types';
  
  // Data from page.server.ts load function
  export let data: {
    funeralHomes: FuneralHome[];
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };

  // Current page number
  let currentPage = data.pagination.page;
  
  // Function to navigate to a specific page
  function goToPage(page: number) {
    if (page < 1 || page > data.pagination.pageCount) return;
    
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    window.location.href = url.toString();
  }
</script>

<svelte:head>
  <title>Funeral Homes | Tributestream</title>
  <meta name="description" content="Manage funeral homes in the Tributestream system" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Funeral Homes</h1>
    <a 
      href="/funeral-homes/new" 
      class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    >
      Add New Funeral Home
    </a>
  </div>

  <!-- Funeral Homes List -->
  {#if data.funeralHomes && data.funeralHomes.length > 0}
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Director
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each data.funeralHomes as funeralHome (funeralHome.id)}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {funeralHome.attributes.name}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {#if funeralHome.attributes.city && funeralHome.attributes.state}
                    {funeralHome.attributes.city}, {funeralHome.attributes.state}
                  {:else if funeralHome.attributes.city}
                    {funeralHome.attributes.city}
                  {:else if funeralHome.attributes.state}
                    {funeralHome.attributes.state}
                  {:else}
                    Not specified
                  {/if}
                </div>
                {#if funeralHome.attributes.zipCode}
                  <div class="text-sm text-gray-500">
                    {funeralHome.attributes.zipCode}
                  </div>
                {/if}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {funeralHome.attributes.phone || 'No phone'}
                </div>
                {#if funeralHome.attributes.website}
                  <div class="text-sm text-gray-500">
                    <a 
                      href={funeralHome.attributes.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="text-blue-600 hover:text-blue-800"
                    >
                      Website
                    </a>
                  </div>
                {/if}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {#if funeralHome.attributes.director?.data}
                    {funeralHome.attributes.director.data.attributes.username}
                  {:else}
                    No director assigned
                  {/if}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a 
                  href={`/funeral-homes/${funeralHome.id}`}
                  class="text-blue-600 hover:text-blue-800 mr-3"
                >
                  View
                </a>
                <a 
                  href={`/funeral-homes/${funeralHome.id}/edit`}
                  class="text-indigo-600 hover:text-indigo-800 mr-3"
                >
                  Edit
                </a>
                <button
                  class="text-red-600 hover:text-red-800"
                  onclick={() => {
                    if (confirm(`Are you sure you want to delete ${funeralHome.attributes.name}?`)) {
                      window.location.href = `/funeral-homes/${funeralHome.id}/delete`;
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    {#if data.pagination.pageCount > 1}
      <div class="flex justify-center mt-6">
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <!-- Previous Page Button -->
          <button
            on:click={() => goToPage(currentPage - 1)}
            class={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
            }`}
            disabled={currentPage === 1}
          >
            <span class="sr-only">Previous</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Page Numbers -->
          {#each Array(data.pagination.pageCount) as _, i}
            <button
              on:click={() => goToPage(i + 1)}
              class={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                currentPage === i + 1
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          {/each}
          
          <!-- Next Page Button -->
          <button
            on:click={() => goToPage(currentPage + 1)}
            class={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === data.pagination.pageCount ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
            }`}
            disabled={currentPage === data.pagination.pageCount}
          >
            <span class="sr-only">Next</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    {/if}
  {:else}
    <div class="bg-white shadow-md rounded-lg p-6 text-center">
      <p class="text-gray-500 mb-4">No funeral homes found.</p>
      <p class="text-sm text-gray-400">Click the "Add New Funeral Home" button to create one.</p>
    </div>
  {/if}
</div>