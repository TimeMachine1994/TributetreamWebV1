<script lang="ts">
  // Import Svelte's enhance
  import { enhance } from '$app/forms';
  
  // Import the data from the server
  export let data;
  
  // Extract data for easier access
  const { tributes, pagination, user, error } = data;
  
  // Reactive state for the form
  let lovedOnesFullName = '';
  let lovedOnesDOB = '';
  let dateOfPassing = '';
  let formError = '';
  
  // Calculate pages for pagination
  const totalPages = Array.from({ length: pagination.pageCount || 1 }, (_, i) => i + 1);
  
  // Format date for display
  function formatDate(dateString: string): string {
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Reset form after submission
  function resetForm() {
    lovedOnesFullName = '';
    lovedOnesDOB = '';
    dateOfPassing = '';
    formError = '';
  }
</script>

<svelte:head>
  <title>Tributes | TributeStream</title>
  <meta name="description" content="View and create tributes for loved ones" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8">Tributes</h1>
  
  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
      <p>{error}</p>
    </div>
  {/if}
  
  <!-- Create Tribute Form -->
  {#if user}
    <div class="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Create a New Tribute</h2>
      
      <form method="POST" action="?/create" use:enhance={() => {
        return async ({ result, update }) => {
          if (result.type === 'failure') {
            // Safely get the message without type assertions
            formError = result.data?.message as string || 'Failed to create tribute';
          } else {
            resetForm();
          }
          await update();
        };
      }}>
        <div class="mb-4">
          <label for="lovedOnesFullName" class="block text-sm font-medium text-gray-700 mb-1">
            Loved One's Full Name *
          </label>
          <input
            type="text"
            id="lovedOnesFullName"
            name="lovedOnesFullName"
            bind:value={lovedOnesFullName}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div class="mb-4">
          <label for="lovedOnesDOB" class="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            id="lovedOnesDOB"
            name="lovedOnesDOB"
            bind:value={lovedOnesDOB}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div class="mb-4">
          <label for="dateOfPassing" class="block text-sm font-medium text-gray-700 mb-1">
            Date of Passing
          </label>
          <input
            type="date"
            id="dateOfPassing"
            name="dateOfPassing"
            bind:value={dateOfPassing}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
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
          Create Tribute
        </button>
      </form>
    </div>
  {:else}
    <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6" role="alert">
      <p>Please <a href="/login" class="underline font-medium">log in</a> to create a tribute.</p>
    </div>
  {/if}
  
  <!-- Tributes List -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#if tributes && tributes.length > 0}
      {#each tributes as tribute}
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-2">{tribute.attributes.lovedOnesFullName}</h2>
            
            <div class="text-gray-600 mb-4">
              {#if tribute.attributes.lovedOnesDOB}
                <p>Born: {formatDate(tribute.attributes.lovedOnesDOB)}</p>
              {/if}
              
              {#if tribute.attributes.dateOfPassing}
                <p>Passed: {formatDate(tribute.attributes.dateOfPassing)}</p>
              {/if}
            </div>
            
            <a
              href={`/tributes/${tribute.id}`}
              class="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md"
            >
              View Tribute
            </a>
          </div>
        </div>
      {/each}
    {:else}
      <div class="col-span-full text-center p-8 bg-gray-50 rounded-lg">
        <p class="text-gray-600">No tributes found. Create the first one!</p>
      </div>
    {/if}
  </div>
  
  <!-- Pagination -->
  {#if pagination && pagination.pageCount > 1}
    <div class="flex justify-center mt-8">
      <nav class="inline-flex rounded-md shadow-sm" aria-label="Pagination">
        <a 
          href={`/tributes?page=${Math.max(1, pagination.page - 1)}`}
          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          class:pointer-events-none={pagination.page === 1}
          class:opacity-50={pagination.page === 1}
        >
          <span class="sr-only">Previous</span>
          &larr;
        </a>
        
        {#each totalPages as page}
          <a
            href={`/tributes?page=${page}`}
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
          href={`/tributes?page=${Math.min(pagination.pageCount, pagination.page + 1)}`}
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