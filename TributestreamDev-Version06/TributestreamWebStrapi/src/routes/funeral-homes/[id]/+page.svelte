<script lang="ts">
  import type { FuneralHome, FuneralHomeAttributes } from '$lib/types/strapi.types';
  
  export let data: {
    funeralHome: FuneralHome;
  };

  const funeralHome = data.funeralHome;
  const { attributes } = funeralHome;

  // Extended runtime type that includes tributes (populated by API)
  interface ExtendedFuneralHomeAttributes extends FuneralHomeAttributes {
    tributes?: {
      data: Array<{
        id: number;
        attributes: {
          lovedOnesFullName: string;
          lovedOnesDOB?: string;
          dateOfPassing?: string;
          slug?: string;
          [key: string]: any;
        }
      }>
    }
  }

  // Cast to extended type
  const extendedAttributes = attributes as ExtendedFuneralHomeAttributes;

  // Function to format address
  function formatAddress(attributes: FuneralHomeAttributes): string {
    const parts = [];
    
    if (attributes.address) {
      parts.push(attributes.address);
    }
    
    const cityStateZip = [];
    if (attributes.city) {
      cityStateZip.push(attributes.city);
    }
    
    if (attributes.state) {
      if (cityStateZip.length > 0) {
        cityStateZip.push(`, ${attributes.state}`);
      } else {
        cityStateZip.push(attributes.state);
      }
    }
    
    if (attributes.zipCode) {
      cityStateZip.push(` ${attributes.zipCode}`);
    }
    
    if (cityStateZip.length > 0) {
      parts.push(cityStateZip.join(''));
    }
    
    return parts.join(', ');
  }

  // Function to handle delete confirmation
  function confirmDelete() {
    if (confirm(`Are you sure you want to delete ${attributes.name}?`)) {
      window.location.href = `/funeral-homes/${funeralHome.id}/delete`;
    }
  }
</script>

<svelte:head>
  <title>{attributes.name} | Funeral Home | Tributestream</title>
  <meta name="description" content={`View details for ${attributes.name} funeral home`} />
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="mb-6">
    <a 
      href="/funeral-homes" 
      class="text-blue-600 hover:text-blue-800 flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
      Back to Funeral Homes
    </a>
  </div>

  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">{attributes.name}</h1>
    <div class="flex space-x-4">
      <a 
        href={`/funeral-homes/${funeralHome.id}/edit`} 
        class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
      >
        Edit
      </a>
      <button 
        on:click={confirmDelete}
        class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
      >
        Delete
      </button>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <!-- Funeral Home Information -->
    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Contact Information</h2>
      
      <div class="mb-4">
        <h3 class="text-sm font-medium text-gray-500">Address</h3>
        <p class="mt-1">{formatAddress(attributes)}</p>
      </div>
      
      {#if attributes.phone}
        <div class="mb-4">
          <h3 class="text-sm font-medium text-gray-500">Phone</h3>
          <p class="mt-1">
            <a href={`tel:${attributes.phone}`} class="text-blue-600 hover:text-blue-800">
              {attributes.phone}
            </a>
          </p>
        </div>
      {/if}
      
      
      {#if attributes.website}
        <div class="mb-4">
          <h3 class="text-sm font-medium text-gray-500">Website</h3>
          <p class="mt-1">
            <a 
              href={attributes.website} 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-blue-600 hover:text-blue-800 flex items-center"
            >
              {attributes.website}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </p>
        </div>
      {/if}
    </div>
    
    <!-- Director Information -->
    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Director Information</h2>
      
      {#if attributes.director?.data}
        <div class="mb-4">
          <h3 class="text-sm font-medium text-gray-500">Name</h3>
          <p class="mt-1">{attributes.director.data.attributes.username}</p>
        </div>
        
        {#if attributes.director.data.attributes.email}
          <div class="mb-4">
            <h3 class="text-sm font-medium text-gray-500">Email</h3>
            <p class="mt-1">
              <a 
                href={`mailto:${attributes.director.data.attributes.email}`} 
                class="text-blue-600 hover:text-blue-800"
              >
                {attributes.director.data.attributes.email}
              </a>
            </p>
          </div>
        {/if}
      {:else}
        <p class="text-gray-500">No director assigned</p>
      {/if}
    </div>
    
    <!-- Additional Information -->
    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Additional Information</h2>
      
      <p class="text-gray-500">No additional information available</p>
    </div>
  </div>

  <!-- Tributes Associated with this Funeral Home -->
  <div class="bg-white shadow-md rounded-lg overflow-hidden mb-8">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold">Associated Tributes</h2>
    </div>
    
    {#if extendedAttributes.tributes?.data && extendedAttributes.tributes.data.length > 0}
      <ul class="divide-y divide-gray-200">
        {#each extendedAttributes.tributes.data as tribute}
          <li class="px-6 py-4 hover:bg-gray-50">
            <a 
              href={`/tributes/${tribute.id}`}
              class="flex items-center justify-between text-blue-600 hover:text-blue-800"
            >
              <span>
                {tribute.attributes.lovedOnesFullName}
                {#if tribute.attributes.lovedOnesDOB || tribute.attributes.dateOfPassing}
                  <span class="text-gray-500 text-sm">
                    (
                    {#if tribute.attributes.lovedOnesDOB}
                      {new Date(tribute.attributes.lovedOnesDOB).toLocaleDateString()}
                    {/if}
                    {#if tribute.attributes.lovedOnesDOB && tribute.attributes.dateOfPassing}
                      -
                    {/if}
                    {#if tribute.attributes.dateOfPassing}
                      {new Date(tribute.attributes.dateOfPassing).toLocaleDateString()}
                    {/if}
                    )
                  </span>
                {/if}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </a>
          </li>
        {/each}
      </ul>
    {:else}
      <div class="px-6 py-4 text-gray-500">
        No tributes associated with this funeral home.
      </div>
    {/if}
  </div>
</div>