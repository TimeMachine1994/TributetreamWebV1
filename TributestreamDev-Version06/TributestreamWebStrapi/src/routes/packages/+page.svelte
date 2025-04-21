<script lang="ts">
  import { enhance } from '$app/forms';
  
  export let data;
  
  let formVisible = false;
  let creating = false;
  let formName = '';
  let formDescription = '';
  let formPrice = '';
  let formFeatures = '';
  
  let currentPage = data.page || 1;
  let pageSize = data.pageSize || 10;
  
  function toggleForm() {
    formVisible = !formVisible;
    resetForm();
  }
  
  function resetForm() {
    formName = '';
    formDescription = '';
    formPrice = '';
    formFeatures = '';
  }
  
  async function handleSubmit(event: any) {
    creating = true;
  }
  
  function formatCurrency(price: number): string {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(price);
  }
</script>

<svelte:head>
  <title>Packages Management</title>
</svelte:head>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Packages</h1>
    <button 
      class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
      on:click={toggleForm}
    >
      {formVisible ? 'Cancel' : 'Add New Package'}
    </button>
  </div>
  
  {#if formVisible}
    <div class="bg-card text-card-foreground p-6 rounded-lg shadow-sm mb-8 border">
      <h2 class="text-xl font-semibold mb-4">Create New Package</h2>
      
      <form 
        method="POST" 
        action="?/create" 
        class="space-y-4"
        use:enhance={() => {
          handleSubmit(event);
          return ({ result, update }) => {
            creating = false;
            if (result.type === 'success') {
              formVisible = false;
              resetForm();
            }
            update();
          };
        }}
      >
        <div class="grid gap-4">
          <div class="space-y-2">
            <label for="name" class="text-sm font-medium">Package Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              bind:value={formName}
              required 
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div class="space-y-2">
            <label for="description" class="text-sm font-medium">Description</label>
            <textarea 
              id="description" 
              name="description" 
              bind:value={formDescription}
              rows="3" 
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>
          
          <div class="space-y-2">
            <label for="price" class="text-sm font-medium">Price</label>
            <input 
              type="number" 
              id="price" 
              name="price" 
              bind:value={formPrice}
              min="0" 
              step="0.01" 
              required 
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div class="space-y-2">
            <label for="features" class="text-sm font-medium">Features (comma separated)</label>
            <textarea 
              id="features" 
              name="features" 
              bind:value={formFeatures}
              rows="3" 
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Feature 1, Feature 2, Feature 3"
            ></textarea>
          </div>
        </div>
        
        <div class="flex justify-end">
          <button 
            type="submit" 
            class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create Package'}
          </button>
        </div>
      </form>
    </div>
  {/if}
  
  {#if data.packages?.length > 0}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each data.packages as pkg}
        <div class="bg-card text-card-foreground p-4 rounded-lg shadow-sm border">
          <h3 class="text-lg font-semibold mb-2">{pkg.attributes.name}</h3>
          <p class="text-sm text-muted-foreground mb-2">{pkg.attributes.description || 'No description'}</p>
          <p class="font-medium mb-2">{formatCurrency(pkg.attributes.price)}</p>
          
          {#if pkg.attributes.features && pkg.attributes.features.length > 0}
            <div class="mt-3">
              <h4 class="text-sm font-medium mb-1">Features:</h4>
              <ul class="list-disc list-inside text-sm">
                {#each pkg.attributes.features as feature}
                  <li>{feature}</li>
                {/each}
              </ul>
            </div>
          {/if}
          
          <div class="flex justify-end mt-4 gap-2">
            <a 
              href={`/packages/${pkg.id}`} 
              class="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/90 transition-colors"
            >
              View
            </a>
            <a 
              href={`/packages/${pkg.id}/edit`} 
              class="px-3 py-1 bg-accent text-accent-foreground rounded text-sm hover:bg-accent/90 transition-colors"
            >
              Edit
            </a>
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Pagination -->
    {#if data.pagination?.pageCount > 1}
      <div class="flex justify-center mt-8">
        <div class="flex space-x-1">
          {#if currentPage > 1}
            <a 
              href={`?page=${currentPage - 1}&pageSize=${pageSize}`}
              class="px-3 py-2 border rounded hover:bg-muted transition-colors"
            >
              Previous
            </a>
          {/if}
          
          {#each Array(data.pagination.pageCount) as _, i}
            <a 
              href={`?page=${i + 1}&pageSize=${pageSize}`}
              class="px-3 py-2 border rounded hover:bg-muted transition-colors" 
              class:bg-primary={currentPage === i + 1} 
              class:text-primary-foreground={currentPage === i + 1}
            >
              {i + 1}
            </a>
          {/each}
          
          {#if currentPage < data.pagination.pageCount}
            <a 
              href={`?page=${currentPage + 1}&pageSize=${pageSize}`}
              class="px-3 py-2 border rounded hover:bg-muted transition-colors"
            >
              Next
            </a>
          {/if}
        </div>
      </div>
    {/if}
  {:else}
    <div class="bg-muted p-8 rounded-lg text-center">
      <p class="text-muted-foreground">No packages found.</p>
      {#if !formVisible}
        <button 
          class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          on:click={toggleForm}
        >
          Create Your First Package
        </button>
      {/if}
    </div>
  {/if}
</div>